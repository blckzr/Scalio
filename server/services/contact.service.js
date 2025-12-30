const supabase = require('../config/database');
const logger = require('../utils/logger');

const createContactMessage = async(data) => {
    try{
        const {name, email, subject, message} = data;

        const {data: result, error} = await supabase
            .from('contact_messages')
            .insert([
                {
                name,
                email,
                subject: subject || null,
                message,
                status: 'new'
                }
            ])
            .select()
            .single();

            if(error) {
                logger.error(`Supabase error: ${error.message}`);
                return {error: error.message};
            }
            return {data: result};
    } catch(error) {
        logger.error(`Service error: ${error.message}`);
        return {error: error.message};
    }
};

const getAllMessages = async (filters) => {
  try {
    const { status, page, limit } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error(`Supabase error: ${error.message}`);
      return { error: error.message };
    }

    return {
      data: {
        messages: data,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    };

  } catch (error) {
    logger.error(`Service error: ${error.message}`);
    return { error: error.message };
  }
};

const getMessageById = async (messageId) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Message not found' };
      }
      logger.error(`Supabase error: ${error.message}`);
      return { error: error.message };
    }

    return { data };

  } catch (error) {
    logger.error(`Service error: ${error.message}`);
    return { error: error.message };
  }
};

const updateMessageStatus = async (messageId, status) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('message_id', messageId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Message not found' };
      }
      logger.error(`Supabase error: ${error.message}`);
      return { error: error.message };
    }

    return { data };

  } catch (error) {
    logger.error(`Service error: ${error.message}`);
    return { error: error.message };
  }
};

module.exports = {
  createContactMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus
};