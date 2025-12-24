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
CREATE INDEX IF NOT EXISTS idx_sessions_lobby ON guess_my_answer_sessions(lobby_id);
CREATE INDEX IF NOT EXISTS idx_state_lobby ON guess_my_answer_state(lobby_id);

-- Trigger to update updated_at
CREATE TRIGGER update_lobbies_updated_at BEFORE UPDATE ON lobbies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON guess_my_answer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_state_updated_at BEFORE UPDATE ON guess_my_answer_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE guess_my_answer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guess_my_answer_state ENABLE ROW LEVEL SECURITY;

-- Lobbies policies
CREATE POLICY "Users can view lobbies they are in"
  ON lobbies FOR SELECT
  USING (
    id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lobbies"
  ON lobbies FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their lobbies"
  ON lobbies FOR UPDATE
  USING (auth.uid() = host_id);

-- Lobby participants policies
CREATE POLICY "Users can view participants in their lobbies"
  ON lobby_participants FOR SELECT
  USING (
    lobby_id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join lobbies"
  ON lobby_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON lobby_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave lobbies"
  ON lobby_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Game sessions policies
CREATE POLICY "Users can view sessions in their lobbies"
  ON guess_my_answer_sessions FOR SELECT
  USING (
    lobby_id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions in their lobbies"
  ON guess_my_answer_sessions FOR INSERT
  WITH CHECK (
    lobby_id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sessions in their lobbies"
  ON guess_my_answer_sessions FOR UPDATE
  USING (
    lobby_id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

-- Game state policies
CREATE POLICY "Users can view state in their lobbies"
  ON guess_my_answer_state FOR SELECT
  USING (
    lobby_id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update state in their lobbies"
  ON guess_my_answer_state FOR UPDATE
  USING (
    lobby_id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert state for their lobbies"
  ON guess_my_answer_state FOR INSERT
  WITH CHECK (
    lobby_id IN (
      SELECT lobby_id FROM lobby_participants WHERE user_id = auth.uid()
    )
  );

