import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const ShowOrder = container.resolve(FindOrderService);

    const order = await ShowOrder.execute({ id });

    return response.json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;
    const CreateOrder = container.resolve(CreateOrderService);

    const customer = await CreateOrder.execute({
      customer_id,
      products,
    });
    return response.json(customer);
  }
}
