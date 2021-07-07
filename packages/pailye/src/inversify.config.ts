import 'reflect-metadata';
import { Container } from 'inversify';
import { layoutModule } from './layout/layoutModule';

const container = new Container();

container.load(layoutModule);

export { container };
