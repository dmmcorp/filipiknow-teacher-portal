import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
  httpAction,
  internalMutation,
  internalQuery,
} from './_generated/server';

// This function creates a new student record in the database.
// It checks if the user already has a student record before creating a new one.
export const createStudent = internalMutation({
  args: {
    userId: v.id('users'),
    section: v.id('sections'),
    gradeLevel: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, section, gradeLevel } = args;

    // Check if the user already has a student record
    const existingStudent = await ctx.db
      .query('students')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (existingStudent) {
      throw new Error('Student record already exists for this user.');
    }
    const student = {
      userId,
      section,
      gradeLevel,
    };

    const studentId = await ctx.db.insert('students', student);
    return studentId;
  },
});

// This function retrieves a student record by their user ID.
// It is used to fetch the student information associated with a specific user.
export const getStudentByUserId = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Fetch the student record by userId
    const student = await ctx.db
      .query('students')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!student) {
      throw new Error('Student not found for the given user ID.');
    }
    const teacher = await ctx.db
      .query('teacher_sections')
      .withIndex('by_section', (q) => q.eq('sectionId', student.section))
      .first();
    if (!teacher) {
      throw new Error('Teacher not found for the student.');
    }

    return { ...student, teacher: teacher };
  },
});

// This function retrieves student information based on the user ID provided in the request body.
// It is used to get the student details for a specific user.
export const getStudentInfoAndProgress = httpAction(async (ctx, request) => {
  try {
    const { userId, cachedUpdatedAt } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const student = await ctx.runQuery(internal.students.getStudentByUserId, {
      userId,
    });
    if (!student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const progress = await ctx.runQuery(internal.progress.getProgress, {
      studentId: student._id,
      cachedUpdatedAt: cachedUpdatedAt,
    });
    if (!progress) {
      return new Response(JSON.stringify({ error: 'Progress not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (progress?.message === 'No updates available') {
      return new Response(
        JSON.stringify({ success: true, message: 'No updates available' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        student,
        progress,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
