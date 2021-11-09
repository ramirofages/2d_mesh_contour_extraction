import FloorPlanGLTFLoader from './FloorPlanGLTFLoader';
import FloorPlanGenerator from './floor_plan/FloorPlanGenerator';
import DatGui from './DatGui';

export default class FloorPlanManager
{
  constructor()
  {
    this.load_batches = [];
    this.floor_plans = [];

    DatGui.settings.rebuild = (()=>{
      this.floor_plans[0].generate_mesh(
        DatGui.settings.unit_shrink_amount,                                        
        DatGui.settings.unit_extrude_amount,                                        
        DatGui.settings.floor_slab_extrude_amount,                                        
        DatGui.settings.wall_extrude_amount                                        
      );
    }).bind(this);


  }

  update()
  {
    let i=0;
    while(i < this.load_batches.length)
    {
      let batch = this.load_batches[i];
      if(batch.is_ready())
      {
        let floor_plan = batch.get_floor_plan();
        this.floor_plans.push(floor_plan);
        this.load_batches.splice(i, 1);
        
        batch.notify_ready(floor_plan)
      }
      else
      {
        i++;
      }
    }
  }

  load_gltf(name, path, ready_callback)
  {
    this.load_batches.push(new FloorPlanGLTFLoader(name, path, ready_callback));
  }
}