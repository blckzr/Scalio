const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class Roadmap {
    static async findById(roadmapId) {
        try {
            const { data, error } = await db
                .from('roadmaps')
                .select('*')
                .eq('roadmap_id', roadmapId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            logger.error('Error finding roadmap by ID:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const { data, error } = await db
                .from('roadmaps')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            return data;
        } catch (error) {
            logger.error('Error finding roadmaps by user ID:', error);
            throw error;
        }
    }

    static async create(roadmapData) {
        try {
            const { data, error } = await supabaseAdmin
                .from('roadmaps')
                .insert(roadmapData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            logger.error('Error creating roadmap:', error);
            throw error;
        }
    }

    static async update(roadmapId, updates) {
        try {
            const { data, error } = await supabaseAdmin
                .from('roadmaps')
                .update({
                    ...updates,
                    updated_at: new Date()
                })
                .eq('roadmap_id', roadmapId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            logger.error('Error updating roadmap:', error);
            throw error;
        }
    }
}

module.exports = Roadmap;
