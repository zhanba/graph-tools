import { Container } from 'inversify';
import { layoutModule } from './layout';

const container = new Container();

container.load(layoutModule);

export { container };
