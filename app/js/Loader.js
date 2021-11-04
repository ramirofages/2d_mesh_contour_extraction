import { BaseApplication } from 'ohzi-core';
import { ResourceContainer } from 'ohzi-core';
import { ResourceBatch } from 'ohzi-core';
import { ViewManager } from 'ohzi-core';
import { MathUtilities } from 'ohzi-core';

export default class Loader extends BaseApplication
{
  constructor(api)
  {
    super();
    this.api = api;

    this.batch = new ResourceBatch();
  }

  load()
  {
    this.batch.add_json('config', 'data/config.json', 2000);
    this.batch.add_gltf('plane', 'plane.glb', 1000);
    this.batch.add_gltf('plan', 'plan.glb', 1000);
    this.batch.load(ResourceContainer);
  }


  update()
  {
    if (this.batch.loading_finished)
    {
      if (this.batch.has_errors)
      {
        this.batch.print_errors();
      }
      else
      {
        this.api.render_loop.set_state(this.api.application);
      }
    }
  }
}
