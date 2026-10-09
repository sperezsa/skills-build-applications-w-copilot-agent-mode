import { model, Schema } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    period: { type: String, required: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, min: 0, required: true },
    rank: { type: Number, min: 1, required: true },
  },
  { timestamps: true },
);

leaderboardSchema.index({ period: 1, user: 1 }, { unique: true });

export default model('Leaderboard', leaderboardSchema);