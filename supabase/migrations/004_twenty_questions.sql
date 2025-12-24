-- 20 Questions Game Tables

-- Game sessions table (tracks individual game rounds)
CREATE TABLE IF NOT EXISTS twenty_questions_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  secret_item TEXT NOT NULL,
  answerer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guesser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questions_asked JSONB DEFAULT '[]'::jsonb, -- Array of {question, answer, question_number}
  guesses_made JSONB DEFAULT '[]'::jsonb, -- Array of {guess, is_correct, question_number}
  status TEXT NOT NULL DEFAULT 'selecting' CHECK (status IN ('selecting', 'asking', 'guessed', 'finished')),
  questions_remaining INTEGER NOT NULL DEFAULT 20,
  round_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game state table (real-time game state)
CREATE TABLE IF NOT EXISTS twenty_questions_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE UNIQUE,
  current_session_id UUID REFERENCES twenty_questions_sessions(id) ON DELETE SET NULL,
  current_turn_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game_data JSONB DEFAULT '{}'::jsonb, -- Stores current game state
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_twenty_questions_sessions_lobby ON twenty_questions_sessions(lobby_id);
CREATE INDEX IF NOT EXISTS idx_twenty_questions_state_lobby ON twenty_questions_state(lobby_id);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_twenty_questions_sessions_updated_at ON twenty_questions_sessions;
CREATE TRIGGER update_twenty_questions_sessions_updated_at BEFORE UPDATE ON twenty_questions_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_twenty_questions_state_updated_at ON twenty_questions_state;
CREATE TRIGGER update_twenty_questions_state_updated_at BEFORE UPDATE ON twenty_questions_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

ALTER TABLE twenty_questions_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE twenty_questions_state ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is a participant (reuse from guess_my_answer)
-- This function should already exist from 003_guess_my_answer.sql

-- Game sessions policies
DROP POLICY IF EXISTS "Users can view sessions in their lobbies" ON twenty_questions_sessions;
CREATE POLICY "Users can view sessions in their lobbies"
  ON twenty_questions_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = twenty_questions_sessions.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create sessions in their lobbies" ON twenty_questions_sessions;
CREATE POLICY "Users can create sessions in their lobbies"
  ON twenty_questions_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = twenty_questions_sessions.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update sessions in their lobbies" ON twenty_questions_sessions;
CREATE POLICY "Users can update sessions in their lobbies"
  ON twenty_questions_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = twenty_questions_sessions.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

-- Game state policies
DROP POLICY IF EXISTS "Users can view state in their lobbies" ON twenty_questions_state;
CREATE POLICY "Users can view state in their lobbies"
  ON twenty_questions_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = twenty_questions_state.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can update state in their lobbies" ON twenty_questions_state;
CREATE POLICY "Users can update state in their lobbies"
  ON twenty_questions_state FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = twenty_questions_state.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can insert state for their lobbies" ON twenty_questions_state;
CREATE POLICY "Users can insert state for their lobbies"
  ON twenty_questions_state FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lobbies l
      WHERE l.id = twenty_questions_state.lobby_id
      AND (l.host_id = auth.uid() OR is_lobby_participant(l.id, auth.uid()))
    )
  );

