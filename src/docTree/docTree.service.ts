import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions } from 'mongoose';
import * as path from 'path';
import { DocTree, DocTreeDocument } from './schemas/docTree.schema';

@Injectable()
export class DocTreeService {
  constructor(
    @InjectModel(DocTree.name)
    private readonly DocTreeModel: Model<DocTreeDocument>,
  ) {}

  async findOne({ path }: { path: string }) {
    return this.DocTreeModel.findOne({
      path,
    });
  }

  async getParentNode({ path }: { path: string }, options: SaveOptions = {}) {
    let parentDocTreeNode = await this.DocTreeModel.findOne({
      path,
    });

    if (!parentDocTreeNode) {
      parentDocTreeNode = (
        await this.DocTreeModel.create(
          [
            {
              path,
              totalLineNum: 0,
              translatedLineNum: 0,
              consistentLineNum: 0,
            },
          ],
          options,
        )
      )[0];
    }

    return parentDocTreeNode;
  }

  async addNode(docTree: DocTree, options: SaveOptions = {}) {
    const parentPath = path.join(docTree.path, '..');

    const parentDocTreeNode = await this.getParentNode(
      { path: parentPath },
      options,
    );

    parentDocTreeNode.totalLineNum += docTree.totalLineNum;
    parentDocTreeNode.translatedLineNum += docTree.translatedLineNum;
    parentDocTreeNode.consistentLineNum += docTree.consistentLineNum;

    await parentDocTreeNode.save(options);

    const createdCollection = await this.DocTreeModel.create(
      [{ ...docTree, parent: parentDocTreeNode._id }],
      options,
    );

    return createdCollection[0];
  }

  async calcNodes(options: SaveOptions = {}) {
    let noParentNodes = await this.getNoParentNodes();

    while (noParentNodes.length) {
      for (const node of noParentNodes) {
        const parentPath = path.join(node.path, '..');

        const parentDocTreeNode = await this.getParentNode(
          { path: parentPath },
          options,
        );

        parentDocTreeNode.totalLineNum += node.totalLineNum;
        parentDocTreeNode.translatedLineNum += node.translatedLineNum;
        parentDocTreeNode.consistentLineNum += node.consistentLineNum;

        await parentDocTreeNode.save(options);

        node.parent = parentDocTreeNode._id;

        await node.save(options);
      }

      noParentNodes = await this.getNoParentNodes();
    }
  }

  async getNoParentNodes() {
    const res = await this.DocTreeModel.find({
      parent: null,
      path: { $ne: '/' },
    });
    return res;
  }
}
