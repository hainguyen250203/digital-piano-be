import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { CreateInvoiceDto } from '@/Invoice/dto/invoice-request.dto';
import { InvoiceResponseDto } from '@/Invoice/dto/invoice-response.dto';
import { UpdateInvoiceWithItemsDto } from '@/Invoice/dto/invoice-update.dto';
import { InvoiceQuery } from '@/Invoice/queries/invoice.query';
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@ApiTags('Hóa đơn')
@Controller({
  path: 'invoices',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.staff)
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceQuery: InvoiceQuery) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn (có phân trang)' })
  @ApiOkResponse({ description: 'Danh sách hóa đơn', type: InvoiceResponseDto })
  async getAllInvoices() {
    const invoices = await this.invoiceQuery.getAllInvoices();
    return new SuccessResponseDto(
      'Lấy danh sách hóa đơn thành công',
      plainToInstance(InvoiceResponseDto, invoices, { excludeExtraneousValues: true })
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết hóa đơn theo ID' })
  @ApiOkResponse({ description: 'Chi tiết hóa đơn', type: InvoiceResponseDto })
  @ApiParam({ name: 'id', description: 'ID hóa đơn' })
  async getInvoiceById(@Param('id') id: string) {
    const invoice = await this.invoiceQuery.getInvoiceById(id);
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn với ID ${id}`);
    }
    return new SuccessResponseDto(
      'Lấy chi tiết hóa đơn thành công',
      plainToInstance(InvoiceResponseDto, invoice, { excludeExtraneousValues: true })
    );
  }

  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn mới' })
  @ApiCreatedResponse({ description: 'Hóa đơn đã được tạo', type: InvoiceResponseDto })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    const invoice = await this.invoiceQuery.createInvoice(createInvoiceDto);
    return new SuccessResponseDto(
      'Tạo hóa đơn thành công',
      plainToInstance(InvoiceResponseDto, invoice, { excludeExtraneousValues: true })
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật hóa đơn và các sản phẩm trong hóa đơn' })
  @ApiOkResponse({ description: 'Hóa đơn đã được cập nhật', type: InvoiceResponseDto })
  @ApiParam({ name: 'id', description: 'ID hóa đơn' })
  async updateInvoice(@Param('id') id: string, @Body() updateDto: UpdateInvoiceWithItemsDto) {
    try {
      const invoice = await this.invoiceQuery.updateInvoiceWithItems(id, updateDto);
      if (!invoice) {
        throw new NotFoundException(`Không tìm thấy hóa đơn với ID ${id}`);
      }

      return new SuccessResponseDto(
        'Cập nhật hóa đơn thành công',
        plainToInstance(InvoiceResponseDto, invoice, { excludeExtraneousValues: true })
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi cập nhật hóa đơn: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hóa đơn' })
  @ApiOkResponse({ description: 'Hóa đơn đã được xóa' })
  @ApiParam({ name: 'id', description: 'ID hóa đơn' })
  async deleteInvoice(@Param('id') id: string) {
    const invoice = await this.invoiceQuery.deleteInvoice(id);
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn với ID ${id}`);
    }
    return new SuccessResponseDto('Xóa hóa đơn thành công', null);
  }
}
