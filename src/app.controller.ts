import { Public } from '@/Auth/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App Info')
@Public()
@Controller()
export class AppController {
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
    description: 'Returns the current health status of the API. Access this endpoint at /api/health'
  })
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      baseUrl: '/api'
    };
  }
} 