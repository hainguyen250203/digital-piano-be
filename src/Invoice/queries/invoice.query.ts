import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChangeType, ReferenceType } from '@prisma/client';
import { CreateInvoiceDto, CreateInvoiceItemDto } from '../dto/invoice-request.dto';
import { UpdateInvoiceDto, UpdateInvoiceItemDto } from '../dto/invoice-update.dto';

@Injectable()
export class InvoiceQuery {
  constructor(private prisma: PrismaService) { }

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInvoiceById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const { supplierId, note, items } = dto;

    // Calculate total amount from items
    const totalAmount = items.reduce((sum, item) => sum + item.importPrice * item.quantity, 0);

    return this.prisma.$transaction(async (tx) => {
      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          supplierId,
          totalAmount,
          note,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              importPrice: item.importPrice,
              subtotal: item.quantity * item.importPrice,
            })),
          },
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update stock for each product
      for (const item of items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity + item.quantity },
          });
        } else {
          await tx.stock.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }

        // Create stock log
        const currentStock = stock || await tx.stock.findUnique({ where: { productId: item.productId } });
        if (currentStock) {
          await tx.stockLog.create({
            data: {
              stockId: currentStock.id,
              change: item.quantity,
              changeType: ChangeType.import,
              referenceType: ReferenceType.invoice,
              referenceId: invoice.id,
              note: `Import from invoice #${invoice.id}`,
            },
          });
        }
      }

      return invoice;
    });
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const { supplierId, note } = dto;

    // Check if invoice exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingInvoice) {
      return null;
    }

    // Update invoice data
    return this.prisma.invoice.update({
      where: { id },
      data: {
        supplierId,
        note,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteInvoice(id: string) {
    // First check if invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return null;
    }

    // Use soft deletion instead of physical deletion
    return this.prisma.invoice.update({
      where: { id },
      data: {
        isDeleted: true,
      },
      include: {
        items: true,
        supplier: true,
      },
    });
  }

  async addInvoiceItem(invoiceId: string, item: CreateInvoiceItemDto) {
    const { productId, quantity, importPrice } = item;
    const subtotal = quantity * importPrice;

    return this.prisma.$transaction(async (tx) => {
      // Create the invoice item
      const invoiceItem = await tx.invoiceItem.create({
        data: {
          invoiceId,
          productId,
          quantity,
          importPrice,
          subtotal,
        },
        include: {
          product: true,
        },
      });

      // Update the invoice total
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (invoice) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            totalAmount: invoice.totalAmount + subtotal,
          },
        });
      }

      // Update stock
      const stock = await tx.stock.findUnique({
        where: { productId },
      });

      if (stock) {
        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity + quantity },
        });
      } else {
        await tx.stock.create({
          data: {
            productId,
            quantity,
          },
        });
      }

      // Create stock log
      const currentStock = stock || await tx.stock.findUnique({ where: { productId } });
      if (currentStock) {
        await tx.stockLog.create({
          data: {
            stockId: currentStock.id,
            change: quantity,
            changeType: 'import',
            referenceType: 'invoice',
            referenceId: invoiceId,
            note: `Import from invoice #${invoiceId}`,
          },
        });
      }

      return invoiceItem;
    });
  }

  async removeInvoiceItem(invoiceId: string, itemId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Get the item
      const item = await tx.invoiceItem.findUnique({
        where: { id: itemId },
      });

      if (!item || item.invoiceId !== invoiceId) {
        return null;
      }

      // Delete the item
      await tx.invoiceItem.delete({
        where: { id: itemId },
      });

      // Update the invoice total
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (invoice) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            totalAmount: invoice.totalAmount - item.subtotal,
          },
        });
      }

      return item;
    });
  }

  async updateInvoiceItem(invoiceId: string, itemId: string, updateDto: UpdateInvoiceItemDto) {
    // Validate if the item exists and belongs to the invoice
    const currentItem = await this.prisma.invoiceItem.findFirst({
      where: {
        id: itemId,
        invoiceId: invoiceId
      },
    });

    if (!currentItem) {
      return null;
    }

    return this.prisma.$transaction(async (tx) => {
      // Calculate new values based on update data
      const quantity = updateDto.quantity ?? currentItem.quantity;
      const importPrice = updateDto.importPrice ?? currentItem.importPrice;
      const newSubtotal = quantity * importPrice;
      const subtotalDifference = newSubtotal - currentItem.subtotal;

      // Update the invoice item
      const updatedItem = await tx.invoiceItem.update({
        where: { id: itemId },
        data: {
          quantity,
          importPrice,
          subtotal: newSubtotal,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update the invoice total
      if (subtotalDifference !== 0) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            totalAmount: {
              increment: subtotalDifference
            }
          },
        });
      }

      // Handle stock changes if quantity changed
      const quantityDifference = quantity - currentItem.quantity;
      if (quantityDifference !== 0) {
        const stock = await tx.stock.findUnique({
          where: { productId: currentItem.productId },
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: {
                increment: quantityDifference
              }
            },
          });

          // Create stock log for the update
          await tx.stockLog.create({
            data: {
              stockId: stock.id,
              change: quantityDifference,
              changeType: quantityDifference > 0 ? ChangeType.import : ChangeType.adjustment,
              referenceType: ReferenceType.invoice,
              referenceId: invoiceId,
              note: `Updated item in invoice #${invoiceId}`,
            },
          });
        }
      }

      return updatedItem;
    });
  }

  async batchUpdateInvoiceItems(invoiceId: string, items: { id: string, quantity?: number, importPrice?: number }[]) {
    // Verify the invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      return null;
    }

    // Create a set of item IDs for quick lookup
    const invoiceItemIds = new Set(invoice.items.map(item => item.id));

    // Verify all items belong to this invoice
    for (const item of items) {
      if (!invoiceItemIds.has(item.id)) {
        throw new Error(`Item with ID ${item.id} does not belong to invoice ${invoiceId}`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAdjustment = 0;
      const stockUpdates: Array<{ productId: string; quantityDifference: number }> = [];

      // Process each item update
      for (const itemUpdate of items) {
        const currentItem = await tx.invoiceItem.findUnique({
          where: { id: itemUpdate.id },
        });

        if (!currentItem) continue;

        // Calculate new values
        const quantity = itemUpdate.quantity ?? currentItem.quantity;
        const importPrice = itemUpdate.importPrice ?? currentItem.importPrice;
        const newSubtotal = quantity * importPrice;
        const subtotalDifference = newSubtotal - currentItem.subtotal;
        totalAdjustment += subtotalDifference;

        // Update the item
        await tx.invoiceItem.update({
          where: { id: itemUpdate.id },
          data: {
            quantity,
            importPrice,
            subtotal: newSubtotal,
          },
        });

        // Track stock changes
        if (itemUpdate.quantity && itemUpdate.quantity !== currentItem.quantity) {
          const quantityDifference = itemUpdate.quantity - currentItem.quantity;
          stockUpdates.push({
            productId: currentItem.productId,
            quantityDifference,
          });
        }
      }

      // Update the invoice total if needed
      if (totalAdjustment !== 0) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            totalAmount: {
              increment: totalAdjustment
            }
          },
        });
      }

      // Process stock updates
      for (const update of stockUpdates) {
        const stock = await tx.stock.findUnique({
          where: { productId: update.productId },
        });

        if (stock && update.quantityDifference !== 0) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: {
                increment: update.quantityDifference
              }
            },
          });

          // Create stock log
          await tx.stockLog.create({
            data: {
              stockId: stock.id,
              change: update.quantityDifference,
              changeType: update.quantityDifference > 0 ? ChangeType.import : ChangeType.adjustment,
              referenceType: ReferenceType.invoice,
              referenceId: invoiceId,
              note: `Batch update in invoice #${invoiceId}`,
            },
          });
        }
      }

      // Return the updated invoice with items
      return tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          supplier: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async updateInvoiceWithItems(id: string, dto: { supplierId?: string, note?: string, items?: { id: string, quantity?: number, importPrice?: number }[] }) {
    // Verify the invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return null;
    }

    // Create a set of item IDs for quick lookup
    const invoiceItemIds = new Set(invoice.items.map(item => item.id));

    // Verify all items belong to this invoice
    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        if (!invoiceItemIds.has(item.id)) {
          throw new Error(`Item with ID ${item.id} does not belong to invoice ${id}`);
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update invoice basic info if provided
      let invoiceData = invoice;
      if (dto.supplierId || dto.note !== undefined) {
        invoiceData = await tx.invoice.update({
          where: { id },
          data: {
            ...(dto.supplierId && { supplierId: dto.supplierId }),
            ...(dto.note !== undefined && { note: dto.note }),
          },
          include: {
            items: true
          }
        });
      }

      // 2. Process item updates if provided
      if (dto.items && dto.items.length > 0) {
        let totalAdjustment = 0;
        const stockUpdates: Array<{ productId: string; quantityDifference: number }> = [];

        // Process each item update
        for (const itemUpdate of dto.items) {
          const currentItem = await tx.invoiceItem.findUnique({
            where: { id: itemUpdate.id },
          });

          if (!currentItem) continue;

          // Calculate new values
          const quantity = itemUpdate.quantity ?? currentItem.quantity;
          const importPrice = itemUpdate.importPrice ?? currentItem.importPrice;
          const newSubtotal = quantity * importPrice;
          const subtotalDifference = newSubtotal - currentItem.subtotal;
          totalAdjustment += subtotalDifference;

          // Update the item
          await tx.invoiceItem.update({
            where: { id: itemUpdate.id },
            data: {
              quantity,
              importPrice,
              subtotal: newSubtotal,
            },
          });

          // Track stock changes
          if (itemUpdate.quantity && itemUpdate.quantity !== currentItem.quantity) {
            const quantityDifference = itemUpdate.quantity - currentItem.quantity;
            stockUpdates.push({
              productId: currentItem.productId,
              quantityDifference,
            });
          }
        }

        // Update the invoice total if needed
        if (totalAdjustment !== 0) {
          invoiceData = await tx.invoice.update({
            where: { id },
            data: {
              totalAmount: {
                increment: totalAdjustment
              }
            },
            include: {
              items: true
            }
          });
        }

        // Process stock updates
        for (const update of stockUpdates) {
          const stock = await tx.stock.findUnique({
            where: { productId: update.productId },
          });

          if (stock && update.quantityDifference !== 0) {
            await tx.stock.update({
              where: { id: stock.id },
              data: {
                quantity: {
                  increment: update.quantityDifference
                }
              },
            });

            // Create stock log
            await tx.stockLog.create({
              data: {
                stockId: stock.id,
                change: update.quantityDifference,
                changeType: update.quantityDifference > 0 ? ChangeType.import : ChangeType.adjustment,
                referenceType: ReferenceType.invoice,
                referenceId: id,
                note: `Updated item in invoice #${id}`,
              },
            });
          }
        }
      }

      // Return the updated invoice with all related data
      return invoiceData.id ?
        tx.invoice.findUnique({
          where: { id: invoiceData.id },
          include: {
            supplier: true,
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }) : null;
    });
  }
}
