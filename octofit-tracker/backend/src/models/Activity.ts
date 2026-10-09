import { model, Schema } from 'mongoose';

const activitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['run', 'walk', 'strength'], required: true },
    durationMinutes: { type: Number, min: 1, required: true },
    distanceKm: { type: Number, min: 0, default: 0 },
    points: { type: Number, min: 0, default: 0 },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default model('Activity', activitySchema);