import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const findCustomer = await this.customersRepository.findById(customer_id);

    if (!findCustomer) {
      throw new AppError('customer nao existe');
    }

    const findProducts = await this.productsRepository.findAllById(products);
    if (!findProducts.length) {
      throw new AppError('produto nao existe ou não tem estoque');
    }

    const findProductsIds = findProducts.map(product => product.id);

    const checkInexistentproducts = products.filter(
      product => !findProductsIds.includes(product.id),
      // se ele me retornar pelo menos um numero do array eu ja sei que tem um produto inexistente
    );
    if (checkInexistentproducts.length) {
      throw new AppError(`could not product ${checkInexistentproducts[0].id}`);
    }
    const findProductsNotQuantityAvailable = products.filter(
      product =>
        findProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsNotQuantityAvailable.length) {
      throw new AppError(
        `a quantidade do produto${findProductsNotQuantityAvailable[0].quantity} nao é sufiente para ${findProductsNotQuantityAvailable[0]}`,
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: findProducts.filter(p => p.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: findCustomer,
      products: serializedProducts,
    });

    const OrderedProductsQuantity = products.map(product => ({
      id: product.id,
      quantity:
        findProducts.filter(p => p.id === product.id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(OrderedProductsQuantity);
    return order;
  }
}

export default CreateOrderService;
