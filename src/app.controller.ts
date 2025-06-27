import { Public } from '@/Auth/decorators/public.decorator';
import { PrismaService } from '@/Prisma/prisma.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App Info')
@Public()
@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) { }

  @Get()
  @ApiOperation({
    summary: 'Get application information',
    description: 'Returns detailed information about the Digital Piano E-commerce API. Access this endpoint at /api/'
  })
  getAppInfo() {
    return {
      name: 'Digital Piano E-commerce API',
      version: '1.0.0',
      description: 'Backend API for Digital Piano E-commerce Platform',
      baseUrl: '/api',
      documentation: '/api/docs',
      features: [
        'User Authentication & Authorization',
        'Product Management',
        'Shopping Cart',
        'Order Processing',
        'Payment Integration',
        'Invoice Generation',
        'Wishlist Management',
        'Discount System',
        'Supplier Management',
        'Category & Subcategory Management',
        'Brand Management',
        'Product Type Classification',
        'Cloudinary Image Integration'
      ],
      modules: [
        'Auth',
        'User',
        'Product',
        'Category',
        'SubCategory',
        'Brand',
        'ProductType',
        'Supplier',
        'Cart',
        'Wishlist',
        'Order',
        'Payment',
        'Invoice',
        'Discount'
      ],
      status: 'operational',
      endpoints: {
        health: '/api/health',
        docs: '/api/docs',
        info: '/api/'
      }
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check API health status',
    description: 'Returns the current health status of the API and checks database connection. Access this endpoint at /api/health'
  })
  async getHealthStatus() {
    // Check and reset database connection if needed
    try {
      await this.prismaService.cleanDatabase();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        baseUrl: '/api',
        database: 'connected'
      };
    } catch (error) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        baseUrl: '/api',
        database: 'connection_issue',
        error: error.message
      };
    }
  }
} 