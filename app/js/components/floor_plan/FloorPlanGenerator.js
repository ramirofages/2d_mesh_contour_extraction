import MeshContour from './MeshContour';
import FloorPlan from './FloorPlan';
export default class FloorPlanGenerator
{
  constructor()
  {

  }

  build_from_scene(scene)
  {
    let meshes = [];

    scene.traverse(child=>{
      if(child.geometry)
      {
        meshes.push(child);
      }
    });
    return this.build(meshes);
  }
  build(meshes)
  {
    let regex_units = new RegExp('^Units*')
    let regex_slabs = new RegExp('^FloorSlabs*')
    let regex_walls = new RegExp('^Walls*')

    let extruded_meshes = [];

    let unit_contours = [];
    let slab_contours = [];
    let wall_contours = [];
    let details_meshes = [];

    let unit_neighboor_loops = [];

    for(let i=0; i < meshes.length; i++)
    {
      if(regex_units.test(meshes[i].parent.name) === true || 
         regex_slabs.test(meshes[i].parent.name) === true || 
         regex_walls.test(meshes[i].parent.name) === true)
      {
        let mesh_contour = new MeshContour(meshes[i]);
        if(mesh_contour.edge_loops.length > 0)
        { 
          if(regex_units.test(meshes[i].parent.name) === true)
          {
            unit_contours.push(mesh_contour);
            unit_neighboor_loops.push(mesh_contour.edge_loops[0]);
          }
          if(regex_slabs.test(meshes[i].parent.name) === true)
          {
            slab_contours.push(mesh_contour);
          }
          if(regex_walls.test(meshes[i].parent.name) === true)
          {
            wall_contours.push(mesh_contour);
          }
        }
        else
        {
          console.error("mesh does not contain enough edges ", meshes[i], mesh_contour)
        }
      }
      else
      {
        details_meshes.push(meshes[i])
      }
    }

    // let unit_meshes = [];
    // let floor_slab_meshes = [];
    // let wall_meshes = [];
    // let detail_meshes = [];

    // for(let i=0; i< unit_contours.length; i++)
    // {
    //   unit_contours[i].shrink_away_from_contours(0.2, unit_contours);
    //   let extruded_mesh = unit_contours[i].get_extruded_mesh(1);
    //   unit_meshes.push(extruded_mesh);
    // }
    // for(let i=0; i< slab_contours.length; i++)
    // {
    //   let extruded_mesh = slab_contours[i].get_extruded_mesh(0.1);
    //   floor_slab_meshes.push(extruded_mesh);
    // }
    // for(let i=0; i< wall_contours.length; i++)
    // {
    //   let extruded_mesh = wall_contours[i].get_extruded_mesh(1.5);
    //   wall_meshes.push(extruded_mesh);
    // }

    // for(let i=0; i< details_meshes.length; i++)
    // {
    //   if(details_meshes[i].geometry.index)
    //     details_meshes[i].geometry = details_meshes[i].geometry.toNonIndexed();

    //   detail_meshes.push(details_meshes[i]);
    // }
    return new FloorPlan({
      unit_contours: unit_contours,
      slab_contours: slab_contours,
      wall_contours: wall_contours,
      details_meshes: details_meshes
    });
  }
}