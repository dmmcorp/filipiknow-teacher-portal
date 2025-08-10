import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        name: v.string(), // e.g. "Section 1"
        gradeLevel: v.string(), // e.g. "Grade 9"
        schoolYear: v.string(),
        teacherId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const sectionId = await ctx.db.insert("sections", {
            name: args.name,
            gradeLevel: args.gradeLevel,
            schoolYear: args.schoolYear,
        })

        await ctx.db.insert("teacher_sections", {
            teacherId: args.teacherId,
            sectionId,
        })

        return sectionId
    }
})

export const update = mutation({
    args: {
        id: v.id("sections"), // section id
        name: v.string(),
        gradeLevel: v.string(),
        schoolYear: v.string(),
        teacherId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            name: args.name,
            gradeLevel: args.gradeLevel,
            schoolYear: args.schoolYear,
        }) // section id

        const previousSectionHandling = await ctx.db
            .query("teacher_sections")
            .withIndex("by_section", (q) => q.eq("sectionId", args.id))
            .collect();

        for (const handle of previousSectionHandling) {
            await ctx.db.delete(handle._id);
        }

        await ctx.db.insert("teacher_sections", {
            teacherId: args.teacherId,
            sectionId: args.id,
        });
    }
})

export const remove = mutation({
    args: {
        id: v.id("sections"),
    },
    handler: async (ctx, args) => {
        // Delete teacher assignments for this section
        const assignments = await ctx.db
            .query("teacher_sections")
            .withIndex("by_section", (q) => q.eq("sectionId", args.id))
            .collect();

        for (const assignment of assignments) {
            await ctx.db.delete(assignment._id);
        }

        // Delete the section itself
        await ctx.db.delete(args.id);
    }
});

export const getAllSections = query({
    handler: async (ctx) => {
        const sections = await ctx.db
            .query("sections")
            .collect()

        // get teacher relationships for each section
        const sectionsWithTeachers = await Promise.all(
            sections.map(async (section) => {
                const teacherAssignment = await ctx.db
                    .query("teacher_sections")
                    .withIndex("by_section", (q) => q.eq("sectionId", section._id))
                    .first()

                let assignedTeacher = null;
                if (teacherAssignment) {
                    assignedTeacher = await ctx.db.get(teacherAssignment.teacherId)
                }

                return {
                    ...section,
                    assignedTeacher,
                }
            })
        )

        return sectionsWithTeachers
    }
})

export const getAllTeachers = query({
    handler: async (ctx) => {
        const teachers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "teacher"))
            .collect();

        return teachers
    }
})

export const getSectionsByUserId = query({
    args: {
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const teacherSections = await ctx.db
            .query("teacher_sections")
            .withIndex("by_teacher", (q) => q.eq("teacherId", args.userId))
            .collect();

        const sections = await Promise.all(
            teacherSections.map(async (teacherSection) => {
                const section = await ctx.db.get(teacherSection.sectionId)

                const teacherDetails = await ctx.db.get(args.userId)

                return {
                    ...section,
                    assignedTeacher: teacherDetails
                }
            })
        )

        return sections.filter(section => section !== null)
    }
})

// if ever need yung teacher na naka assign sa section na ito uncomment yung teacherAssignment
// sa ngayon hindi pa naman so, as is muna natin na section lang muna ang nirereturn
export const getSectionById = query({
    args: {
        sectionId: v.id("sections")
    },
    handler: async (ctx, args) => {
        const section = await ctx.db.get(args.sectionId)

        return section;
    }
})

export const getSectionByIdWithStudents = query({
    args: {
        sectionId: v.id("sections")
    },
    handler: async (ctx, args) => {
        const section = await ctx.db.get(args.sectionId)
        if (!section) return null;

        const teacherAssignment = await ctx.db
            .query("teacher_sections")
            .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
            .first();

        let assignedTeacher = null;
        if (teacherAssignment) {
            assignedTeacher = await ctx.db.get(teacherAssignment.teacherId)
        }

        const students = await ctx.db
            .query("students")
            .filter((q) => q.eq(q.field("section"), args.sectionId))
            .collect()

        const studentsWithDetails = await Promise.all(
            students.map(async (student) => {
                const userDetails = await ctx.db.get(student.userId);
                return {
                    ...student,
                    userDetails
                }
            })
        )

        return {
            ...section,
            assignedTeacher,
            students: studentsWithDetails,
        }
    }
})