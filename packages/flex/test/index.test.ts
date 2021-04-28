import { Node } from '../src/node';
import fs from 'fs';
import path from 'path';
import type { NodeProperties } from '../src/types';

const casePath = path.join(__dirname, 'case');
const res = fs.readdirSync(casePath);
const filePaths = res.map((val) => val);

describe('flex box test', () => {
  filePaths.forEach((file) => {
    it(file, () => {
      const data = JSON.parse(fs.readFileSync(path.join(casePath, file), 'utf8'));
      const container = Node.create(data.container);
      data.items.forEach((item: NodeProperties) => {
        const node = Node.create(item);
        container.appendChild(node);
      });
      container.calculateLayout();
      const result = container.getAllComputedLayout();
      expect(result).toStrictEqual(data.result);
    });
  });
});
