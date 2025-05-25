import { AddressModule } from "@/Address/address.module";
import { CartModule } from "@/Cart/cart.module";
import { DiscountModule } from "@/Discount/discount.module";
import { NotificationModule } from "@/notification/notification.module";
import { AdminCancelOrderAction } from "@/Order/actions/admin-cancel-order.action";
import { CreateOrderAction } from "@/Order/actions/create-order.action";
import { RepaymentAction } from "@/Order/actions/repayment.action";
import { UpdateStatusOrderAction } from "@/Order/actions/update-status-order.action";
import { UserCancelOrderAction } from "@/Order/actions/user-cancel-order.action";
import { UserChangePaymentMethodAction } from "@/Order/actions/user-change-payment-method.action";
import { UserConfirmDeliveryAction } from "@/Order/actions/user-confirm-delivery.action";
import { VerifyReturnUrlAction } from "@/Order/actions/verify-return-url.action";
import { OrderController } from "@/Order/api/order.controller";
import { OrderQuery } from "@/Order/queries/order.query";
import { PaymentModule } from "@/Payment/payment.module";
import { PrismaModule } from "@/Prisma/prisma.module";
import { StockModule } from '@/Stock/stock.module';
import { UserModule } from "@/User/user.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
    DiscountModule,
    UserModule,
    AddressModule,
    CartModule,
    NotificationModule,
    PaymentModule,
    StockModule,
  ],
  controllers: [OrderController],
  providers: [OrderQuery, CreateOrderAction, VerifyReturnUrlAction, UserCancelOrderAction,
    UpdateStatusOrderAction, RepaymentAction, AdminCancelOrderAction, UserConfirmDeliveryAction,
    UserChangePaymentMethodAction],
  exports: [OrderQuery, CreateOrderAction, VerifyReturnUrlAction, UserCancelOrderAction,
    UpdateStatusOrderAction, RepaymentAction, AdminCancelOrderAction, UserConfirmDeliveryAction,
    UserChangePaymentMethodAction]
})
export class OrderModule { }