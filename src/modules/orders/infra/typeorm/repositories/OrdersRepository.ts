import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = await this.ormRepository.create({
      customer,
      order_products: products,
    });
    await this.ormRepository.save(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    // aqui estou trazendo alem do order_products tbm o customer(cliente) junto nesta busca.
    // posso fazer tbm isso usando o eager load direto nas entities
    const orderId = await this.ormRepository.findOne(id, {
      relations: ['order_products', 'customer'],
    });
    return orderId;
  }
}

export default OrdersRepository;
