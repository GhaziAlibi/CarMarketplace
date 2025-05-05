import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware factory for validating request data against a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param source Where to find the data to validate ('body', 'query', 'params')
 * @returns Express middleware function that validates the request
 */
export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the data to validate based on the source
      const data = source === 'body' ? req.body : 
                  source === 'query' ? req.query : 
                  req.params;
      
      // Validate the data against the schema
      const validatedData = await schema.parseAsync(data);
      
      // Replace the original data with the validated data
      // This ensures type safety and removes any extraneous fields
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else {
        req.params = validatedData;
      }
      
      next();
    } catch (error) {
      // If validation fails, respond with a 400 Bad Request
      if (error instanceof ZodError) {
        // Format the error messages
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      
      // For other errors, pass to the error handler
      next(error);
    }
  };

/**
 * Middleware to sanitize and validate ID parameters
 * 
 * @param idParam The name of the ID parameter to validate
 * @returns Express middleware function
 */
export const validateId = (idParam: string = 'id') => 
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[idParam];
    
    // Check if ID exists
    if (!id) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: [{ path: idParam, message: 'ID parameter is required' }] 
      });
    }
    
    // Attempt to parse and validate ID
    const parsedId = parseInt(id, 10);
    
    if (isNaN(parsedId) || parsedId.toString() !== id || parsedId <= 0) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: [{ path: idParam, message: 'Invalid ID format' }] 
      });
    }
    
    // Replace the string ID with the validated numeric ID
    req.params[idParam] = parsedId.toString();
    
    next();
  };