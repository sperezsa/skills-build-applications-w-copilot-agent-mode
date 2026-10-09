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
      { username: 'samira.brooks', email: 'samira.brooks@example.com', displayName: 'Samira Brooks' },
      { username: 'ethan.kim', email: 'ethan.kim@example.com', displayName: 'Ethan Kim' },
      { username: 'zoe.williams', email: 'zoe.williams@example.com', displayName: 'Zoe Williams' },
      { username: 'mateo.garcia', email: 'mateo.garcia@example.com', displayName: 'Mateo Garcia' },
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
      {
        name: 'Octo Sprinters',
        description: 'A team focused on speed and consistency.',
        members: [users[0]._id, users[1]._id],
      },
      {
        name: 'Reef Runners',
        description: 'Building endurance one workout at a time.',
        members: [users[2]._id, users[3]._id],
      },
      {
        name: 'Octo Pacers',
        description: 'A steady, supportive crew that keeps moving together.',
        members: [users[4]._id, users[5]._id],
      },
      {
        name: 'Coral Climbers',
        description: 'A team balancing strength, mobility, and cardio.',
        members: [users[6]._id, users[7]._id],
      },
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

    const createActivityRecord = (
      userIndex: number,
      type: 'run' | 'walk' | 'strength',
      durationMinutes: number,
      distanceKm: number,
      points: number,
      occurredAt: string,
    ) => ({
      user: users[userIndex]._id,
      type,
      durationMinutes,
      distanceKm,
      points,
      occurredAt: new Date(occurredAt),
    });

    const activityRecords = [
      createActivityRecord(0, 'run', 32, 5.1, 85, '2026-10-06T16:00:00Z'),
      createActivityRecord(0, 'strength', 30, 0, 58, '2026-10-02T16:30:00Z'),
      createActivityRecord(0, 'walk', 45, 3.5, 55, '2026-09-27T10:00:00Z'),
      createActivityRecord(1, 'strength', 40, 0, 75, '2026-10-07T16:00:00Z'),
      createActivityRecord(1, 'run', 28, 4.2, 72, '2026-10-04T09:30:00Z'),
      createActivityRecord(1, 'walk', 30, 2.5, 38, '2026-09-28T10:00:00Z'),
      createActivityRecord(2, 'walk', 42, 3.2, 60, '2026-10-08T16:00:00Z'),
      createActivityRecord(2, 'run', 34, 4.8, 80, '2026-10-02T15:45:00Z'),
      createActivityRecord(2, 'strength', 25, 0, 50, '2026-09-25T16:00:00Z'),
      createActivityRecord(3, 'run', 28, 4.4, 95, '2026-10-09T16:00:00Z'),
      createActivityRecord(3, 'strength', 35, 0, 68, '2026-10-01T16:15:00Z'),
      createActivityRecord(3, 'walk', 36, 2.9, 47, '2026-09-24T16:00:00Z'),
      createActivityRecord(4, 'run', 25, 3.8, 70, '2026-10-08T15:30:00Z'),
      createActivityRecord(4, 'walk', 50, 4, 62, '2026-10-03T09:00:00Z'),
      createActivityRecord(4, 'strength', 30, 0, 55, '2026-09-26T16:00:00Z'),
      createActivityRecord(5, 'strength', 45, 0, 82, '2026-10-07T15:45:00Z'),
      createActivityRecord(5, 'walk', 38, 3, 48, '2026-10-02T16:00:00Z'),
      createActivityRecord(5, 'run', 36, 5.5, 92, '2026-09-25T15:30:00Z'),
      createActivityRecord(6, 'walk', 35, 2.7, 48, '2026-10-06T16:15:00Z'),
      createActivityRecord(6, 'strength', 25, 0, 52, '2026-10-01T15:45:00Z'),
      createActivityRecord(6, 'run', 30, 4, 78, '2026-09-24T15:30:00Z'),
      createActivityRecord(7, 'run', 39, 6.2, 105, '2026-10-09T15:30:00Z'),
      createActivityRecord(7, 'strength', 38, 0, 73, '2026-10-04T10:00:00Z'),
      createActivityRecord(7, 'walk', 46, 3.8, 58, '2026-09-27T09:30:00Z'),
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

    const weekStart = new Date('2026-10-05T00:00:00Z');
    const nextWeekStart = new Date('2026-10-12T00:00:00Z');
    const leaderboardRecords = users
      .map((user) => ({
        user: user._id,
        points: activityRecords
          .filter(
            (activity) =>
              activity.user.equals(user._id) &&
              activity.occurredAt >= weekStart &&
              activity.occurredAt < nextWeekStart,
          )
          .reduce((total, activity) => total + activity.points, 0),
      }))
      .sort((first, second) => second.points - first.points)
      .map((record, index) => ({
        ...record,
        period: '2026-W41',
        rank: index + 1,
      }));

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
      {
        title: 'Neighborhood Walk',
        description: 'A relaxed, low-impact session that fits into a busy afternoon.',
        level: 'beginner',
        durationMinutes: 30,
        activities: ['5-minute easy start', '20-minute brisk walk', '5-minute cool-down'],
      },
      {
        title: 'Core Stability',
        description: 'A short bodyweight session focused on controlled movement.',
        level: 'beginner',
        durationMinutes: 20,
        activities: ['Dead bug', 'Bird dog', 'Side plank', 'Glute bridge'],
      },
      {
        title: 'Tempo Builder',
        description: 'A moderate run with a comfortably challenging middle section.',
        level: 'intermediate',
        durationMinutes: 35,
        activities: ['8-minute warm-up', '18-minute tempo run', '9-minute cool-down'],
      },
      {
        title: 'Mobility Reset',
        description: 'Gentle mobility work for a lighter recovery day.',
        level: 'beginner',
        durationMinutes: 15,
        activities: ['Hip mobility', 'Thoracic rotations', 'Calf stretch', 'Shoulder circles'],
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
