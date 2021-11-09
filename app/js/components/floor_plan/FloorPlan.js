import {Object3D} from 'three';
import {BufferAttribute} from 'three';
import {MeshLambertMaterial} from 'three';
import {ArrayUtilities} from 'ohzi-core';
import {MeshBatcher} from 'ohzi-core';

export default class FloorPlan extends Object3D
{
  constructor({
    unit_contours  = [],
    slab_contours  = [],
    wall_contours  = [],
    details_meshes = []
  })
  {
    super();

    this.unit_contours    = unit_contours;
    this.slab_contours    = slab_contours;
    this.wall_contours    = wall_contours;
    this.details_meshes   = details_meshes;


    this.generate_2D_mesh(0.2, 1, 0.1, 1.5);

  }

  generate_2D_mesh()
  {
    this.generate_mesh();
  }

  generate_mesh(
    unit_shrink_amount        = 0, 
    unit_extrude_amount       = 0, 
    floor_slab_extrude_amount = 0, 
    wall_extrude_amount       = 0
  )
  {
    if(this.children.length > 0)
    {
      let root = this.children[0];
      for(let i=0; i< root.children.length; i++)
      {
        root.children[i].geometry.dispose();
        root.children[i].material.dispose();
      }
      this.remove(this.children[0]);
    }

    let root = new Object3D();
    this.add(root);

    for(let i=0; i< this.unit_contours.length; i++)
    {
      this.unit_contours[i].reset();
      this.unit_contours[i].shrink_away_from_contours(unit_shrink_amount, this.unit_contours);
      let extruded_mesh = this.unit_contours[i].get_extruded_mesh(unit_extrude_amount);
      root.add(extruded_mesh);
    }
    for(let i=0; i< this.slab_contours.length; i++)
    {
      let extruded_mesh = this.slab_contours[i].get_extruded_mesh(floor_slab_extrude_amount);
      root.add(extruded_mesh);
    }
    for(let i=0; i< this.wall_contours.length; i++)
    {
      let extruded_mesh = this.wall_contours[i].get_extruded_mesh(wall_extrude_amount);
      root.add(extruded_mesh);
    }

    for(let i=0; i< this.details_meshes.length; i++)
    {
      if(this.details_meshes[i].geometry.index)
        this.details_meshes[i].geometry = this.details_meshes[i].geometry.toNonIndexed();

      root.add(this.details_meshes[i]);
    }
  }

  clone()
  {
    let unit_contours  = [];
    let slab_contours  = [];
    let wall_contours  = [];

    for(let i=0; i< this.unit_contours.length; i++)
    {
      unit_contours.push(this.unit_contours[i].clone());
    }

    for(let i=0; i< this.slab_contours.length; i++)
    {
      slab_contours.push(this.slab_contours[i].clone());
    }

    for(let i=0; i< this.wall_contours.length; i++)
    {
      wall_contours.push(this.wall_contours[i].clone());
    }

    for(let i=0; i< this.unit_contours.length; i++)
    {
      unit_contours.push(this.unit_contours[i].clone());
    }

    return new FloorPlan({
      unit_contours: unit_contours,
      slab_contours: slab_contours,
      wall_contours: wall_contours,
      details_meshes: this.details_meshes
    })
  }
}