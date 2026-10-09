import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Leaderboard from '../models/Leaderboard.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);

    console.log('Connected to octofit_db');

    const userRecords = [
      { username: 'maya.chen', email: 'maya.chen@example.com', displayName: 'Maya Chen' },
      { username: 'leo.martinez', email: 'leo.martinez@example.com', displayName: 'Leo Martinez' },
      { username: 'nina.patel', email: 'nina.patel@example.com', displayName: 'Nina Patel' },
      { username: 'ari.johnson', email: 'ari.johnson@example.com', displayName: 'Ari Johnson' },
    ];

    const users = await Promise.all(
      userRecords.map(async (record) => {
        const user = await User.findOneAndUpdate(
          { username: record.username },
          { $set: record },
          { new: true, upsert: true },
        );
        if (!user) throw new Error(`Unable to seed user ${record.username}`);
        return user;
      }),
    );

    const teamRecords = [
      { name: 'Octo Sprinters', description: 'A team focused on speed and consistency.', members: [users[0]._id, users[1]._id] },
      { name: 'Reef Runners', description: 'Building endurance one workout at a time.', members: [users[2]._id, users[3]._id] },
    ];

    const teams = await Promise.all(
      teamRecords.map(async (record) => {
        const team = await Team.findOneAndUpdate(
          { name: record.name },
          { $set: record },
          { new: true, upsert: true },
        );
        if (!team) throw new Error(`Unable to seed team ${record.name}`);
        return team;
      }),
    );

    await Promise.all(
      users.map((user, index) =>
        User.updateOne({ _id: user._id }, { $set: { team: teams[Math.floor(index / 2)]._id } }),
      ),
    );

    const activityRecords = [
      { user: users[0]._id, type: 'run', durationMinutes: 32, distanceKm: 5.1, points: 85, occurredAt: new Date('2026-10-06T16:00:00Z') },
      { user: users[1]._id, type: 'strength', durationMinutes: 40, distanceKm: 0, points: 75, occurredAt: new Date('2026-10-07T16:00:00Z') },
      { user: users[2]._id, type: 'walk', durationMinutes: 42, distanceKm: 3.2, points: 60, occurredAt: new Date('2026-10-08T16:00:00Z') },
      { user: users[3]._id, type: 'run', durationMinutes: 28, distanceKm: 4.4, points: 95, occurredAt: new Date('2026-10-09T16:00:00Z') },
    ];

    await Promise.all(
      activityRecords.map(({ user, type, occurredAt, ...record }) =>
        Activity.findOneAndUpdate(
          { user, type, occurredAt },
          { $set: { user, type, occurredAt, ...record } },
          { new: true, upsert: true },
        ),
      ),
    );

    const leaderboardRecords = [
      { period: '2026-W41', user: users[0]._id, points: 185, rank: 1 },
      { period: '2026-W41', user: users[1]._id, points: 170, rank: 2 },
      { period: '2026-W41', user: users[2]._id, points: 152, rank: 3 },
      { period: '2026-W41', user: users[3]._id, points: 135, rank: 4 },
    ];

    await Promise.all(
      leaderboardRecords.map((record) =>
        Leaderboard.findOneAndUpdate(
          { period: record.period, user: record.user },
          { $set: record },
          { new: true, upsert: true },
        ),
      ),
    );

    const workoutRecords = [
      {
        title: 'Starter Run',
        description: 'An easy-paced run with a short warm-up and cool-down.',
        level: 'beginner',
        durationMinutes: 25,
        activities: ['5-minute warm-up walk', '15-minute easy run', '5-minute cool-down'],
      },
      {
        title: 'Strength Circuit',
        description: 'A balanced bodyweight circuit with recovery between rounds.',
        level: 'intermediate',
        durationMinutes: 35,
        activities: ['Squats', 'Push-ups', 'Lunges', 'Plank'],
      },
      {
        title: 'Endurance Intervals',
        description: 'Alternating steady running and faster intervals.',
        level: 'advanced',
        durationMinutes: 40,
        activities: ['10-minute warm-up', '6 running intervals', '5-minute cool-down'],
      },
    ];

    await Promise.all(
      workoutRecords.map((record) =>
        Workout.findOneAndUpdate(
          { title: record.title },
          { $set: record },
          { new: true, upsert: true },
        ),
      ),
    );

    console.log('Seeded users, teams, activities, leaderboard, and workouts');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
