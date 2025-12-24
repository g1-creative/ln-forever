-- Guess My Answer Game Tables

-- Lobbies table (game rooms)
CREATE TABLE IF NOT EXISTS lobbies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL DEFAULT 'guess_my_answer',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  max_players INTEGER NOT NULL DEFAULT 2,
  current_players INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Lobby participants table
CREATE TABLE IF NOT EXISTS lobby_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_ready BOOLEAN DEFAULT false,
  UNIQUE(lobby_id, user_id)
);

-- Lobby invitations table
CREATE TABLE IF NOT EXISTS lobby_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lobby_id, invitee_id),
  CHECK (inviter_id != invitee_id)
);

-- Game sessions table (tracks individual game rounds)
CREATE TABLE IF NOT EXISTS guess_my_answer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answerer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_answer TEXT,
  guesses JSONB DEFAULT '[]'::jsonb, -- Array of {user_id, guess, is_correct}
  status TEXT NOT NULL DEFAULT 'answering' CHECK (status IN ('answering', 'guessing', 'revealed', 'finished')),
  round_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game state table (real-time game state)
CREATE TABLE IF NOT EXISTS guess_my_answer_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE UNIQUE,
  current_session_id UUID REFERENCES guess_my_answer_sessions(id) ON DELETE SET NULL,
  current_turn_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game_data JSONB DEFAULT '{}'::jsonb, -- Stores current game state
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lobbies_host ON lobbies(host_id);
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);
CREATE INDEX IF NOT EXISTS idx_lobby_participants_lobby ON lobby_participants(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_participants_user ON lobby_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_lobby_invitations_lobby ON lobby_invitations(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_invitations_invitee ON lobby_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_lobby_invitations_status ON lobby_invitations(status);
CREATE INDEX IF NOT EXISTS idx_sessions_lobby ON guess_my_answer_sessions(lobby_id);
CREATE INDEX IF NOT EXISTS idx_state_lobby ON guess_my_answer_state(lobby_id);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_lobbies_updated_at ON lobbies;
CREATE TRIGGER update_lobbies_updated_at BEFORE UPDATE ON lobbies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON guess_my_answer_sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON guess_my_answer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_state_updated_at ON guess_my_answer_state;
CREATE TRIGGER update_state_updated_at BEFORE UPDATE ON guess_my_answer_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lobby_invitations_updated_at ON lobby_invitations;
CREATE TRIGGER update_lobby_invitations_updated_at BEFORE UPDATE ON lobby_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to check if user is a participant (bypasses RLS)
CREATE OR REPLACE FUNCTION is_lobby_participant(check_lobby_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lobby_participants
    WHERE lobby_id = check_lobby_id
    AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_lobby_participant(UUID, UUID) TO authenticated;

-- RLS Policies

ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guess_my_answer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guess_my_answer_state ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has a pending invitation
CREATE OR REPLACE FUNCTION has_lobby_invitation(check_lobby_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM lobby_invitations
    WHERE lobby_id = check_lobby_id
    AND invitee_id = check_user_id
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_lobby_invitation(UUID, UUID) TO authenticated;

-- Lobbies policies
DROP POLICY IF EXISTS "Users can view lobbies they are in" ON lobbies;
CREATE POLICY "Users can view lobbies they are in"
  ON lobbies FOR SELECT
  USING (
    host_id = auth.uid()
    OR is_lobby_participant(id, auth.uid())
    OR has_lobby_invitation(id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can create lobbies" ON lobbies;
CREATE POLICY "Users can create lobbies"
  ON lobbies FOR INSERT
  WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts can update their lobbies" ON lobbies;
CREATE POLICY "Hosts can update their lobbies"
  ON lobbies FOR UPDATE
  USING (auth.uid() = host_id);

-- Lobby participants policies
DROP POLICY IF EXISTS "Users can view participants in their lobbies" ON lobby_participants;
CREATE POLICY "Users can view participants in their lobbies"
  ON lobby_participants FOR SELECT
  USING (
    -- User is viewing their own participation record
    user_id = auth.uid()
    OR
    -- User is the host of the lobby
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = lobby_participants.lobby_id
      AND l.host_id = auth.uid()
    )
    OR
    -- User is a participant in the same lobby
    is_lobby_participant(lobby_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can join lobbies" ON lobby_participants;
CREATE POLICY "Users can join lobbies"
  ON lobby_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own participation" ON lobby_participants;
CREATE POLICY "Users can update their own participation"
  ON lobby_participants FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave lobbies" ON lobby_participants;
CREATE POLICY "Users can leave lobbies"
  ON lobby_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Lobby invitations policies
DROP POLICY IF EXISTS "Users can view invitations they sent or received" ON lobby_invitations;
CREATE POLICY "Users can view invitations they sent or received"
  ON lobby_invitations FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Hosts can invite friends to their lobbies" ON lobby_invitations;
CREATE POLICY "Hosts can invite friends to their lobbies"
  ON lobby_invitations FOR INSERT
  WITH CHECK (
    auth.uid() = inviter_id
    AND EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = lobby_invitations.lobby_id
      AND l.host_id = auth.uid()
      AND l.status = 'waiting'
      AND l.current_players < l.max_players
    )
    AND EXISTS (
      SELECT 1 FROM friends f
      WHERE (f.user1_id = auth.uid() AND f.user2_id = lobby_invitations.invitee_id)
      OR (f.user2_id = auth.uid() AND f.user1_id = lobby_invitations.invitee_id)
    )
  );

DROP POLICY IF EXISTS "Invitees can update their invitations" ON lobby_invitations;
CREATE POLICY "Invitees can update their invitations"
  ON lobby_invitations FOR UPDATE
  USING (auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Users can delete their own invitations" ON lobby_invitations;
CREATE POLICY "Users can delete their own invitations"
  ON lobby_invitations FOR DELETE
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Game sessions policies
DROP POLICY IF EXISTS "Users can view sessions in their lobbies" ON guess_my_answer_sessions;
CREATE POLICY "Users can view sessions in their lobbies"
  ON guess_my_answer_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = guess_my_answer_sessions.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create sessions in their lobbies" ON guess_my_answer_sessions;
CREATE POLICY "Users can create sessions in their lobbies"
  ON guess_my_answer_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = guess_my_answer_sessions.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update sessions in their lobbies" ON guess_my_answer_sessions;
CREATE POLICY "Users can update sessions in their lobbies"
  ON guess_my_answer_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = guess_my_answer_sessions.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

-- Game state policies
DROP POLICY IF EXISTS "Users can view state in their lobbies" ON guess_my_answer_state;
CREATE POLICY "Users can view state in their lobbies"
  ON guess_my_answer_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = guess_my_answer_state.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update state in their lobbies" ON guess_my_answer_state;
CREATE POLICY "Users can update state in their lobbies"
  ON guess_my_answer_state FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = guess_my_answer_state.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can insert state for their lobbies" ON guess_my_answer_state;
CREATE POLICY "Users can insert state for their lobbies"
  ON guess_my_answer_state FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = guess_my_answer_state.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

