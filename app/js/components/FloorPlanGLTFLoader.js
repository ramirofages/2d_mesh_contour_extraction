import {ResourceBatch} from 'ohzi-core';
import {ResourceContainer} from 'ohzi-core';

export default class FloorPlanGLTFLoader
{
  constructor(floor_plan_name, path, ready_callback)
  {
    this.floor_plan_name = floor_plan_name;
    this.file_path = path;

    this.batch = new ResourceBatch();
    this.batch.add_gltf(floor_plan_name, path, 1000);
    this.batch.load(ResourceContainer);

    this.ready_callback = ready_callback;
  }

  is_ready()
  {
    if (this.batch.loading_finished)
    {
      if (this.batch.has_errors)
      {
        this.batch.print_errors();
      }
    }

    return this.batch.loading_finished;
  }

  get_scene()
  {
    return ResourceContainer.get(this.floor_plan_name).scene;
  }

  notify_ready(floor_plan)
  {
    this.ready_callback(floor_plan);
  }

}