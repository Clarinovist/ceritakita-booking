import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserById,
  seedDefaultAdmin 
} from '@/lib/user-management';
import { logger, createErrorResponse } from '@/lib/logger';
import { rateLimiters } from '@/lib/rate-limit';

// Initialize default admin on first request
seedDefaultAdmin();

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.moderate(req);
    if (rateLimitResult) {
      logger.warn('Rate limit exceeded for GET users', {
        ip: req.headers.get('x-forwarded-for')
      });
      return rateLimitResult;
    }

    // Require authentication
    const authCheck = await requireAuth(req);
    if (authCheck) return authCheck;

    const users = getAllUsers();
    
    logger.info('Users retrieved successfully', {
      count: users.length
    });

    return NextResponse.json(users);
  } catch (error) {
    const { error: errorResponse, statusCode } = createErrorResponse(error as Error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.moderate(req);
    if (rateLimitResult) {
      logger.warn('Rate limit exceeded for POST users', {
        ip: req.headers.get('x-forwarded-for')
      });
      return rateLimitResult;
    }

    // Require authentication
    const authCheck = await requireAuth(req);
    if (authCheck) return authCheck;

    const body = await req.json();
    const { username, password, role } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (role && !['admin', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be admin or staff', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const newUser = createUser({
      username,
      password,
      role: role || 'staff'
    });

    logger.info('User created successfully', {
      username: newUser.username,
      role: newUser.role
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Username already exists') {
      return NextResponse.json(
        { error: 'Username already exists', code: 'DUPLICATE_USERNAME' },
        { status: 409 }
      );
    }

    const { error: errorResponse, statusCode } = createErrorResponse(error as Error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.moderate(req);
    if (rateLimitResult) {
      logger.warn('Rate limit exceeded for PUT users', {
        ip: req.headers.get('x-forwarded-for')
      });
      return rateLimitResult;
    }

    // Require authentication
    const authCheck = await requireAuth(req);
    if (authCheck) return authCheck;

    const body = await req.json();
    const { id, username, password, is_active } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const updatedUser = updateUser(id, {
      username,
      password,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : undefined
    });

    logger.info('User updated successfully', {
      userId: id,
      username: updatedUser.username
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    if (error.message === 'Username already exists') {
      return NextResponse.json(
        { error: 'Username already exists', code: 'DUPLICATE_USERNAME' },
        { status: 409 }
      );
    }

    const { error: errorResponse, statusCode } = createErrorResponse(error as Error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.moderate(req);
    if (rateLimitResult) {
      logger.warn('Rate limit exceeded for DELETE users', {
        ip: req.headers.get('x-forwarded-for')
      });
      return rateLimitResult;
    }

    // Require authentication
    const authCheck = await requireAuth(req);
    if (authCheck) return authCheck;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Prevent deleting the last admin user
    const user = getUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      const allUsers = getAllUsers();
      const adminCount = allUsers.filter(u => u.role === 'admin' && u.is_active === 1).length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last active admin user', code: 'LAST_ADMIN' },
          { status: 400 }
        );
      }
    }

    deleteUser(id);

    logger.info('User deleted successfully', {
      userId: id,
      username: user.username
    });

    return NextResponse.json({ success: true, userId: id });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { error: errorResponse, statusCode } = createErrorResponse(error as Error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
