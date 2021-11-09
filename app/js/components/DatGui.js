import * as dat from 'dat.gui';

class DatGUI
{
  constructor()
  {
    this.dat_gui = undefined;

    this.settings = {
      unit_shrink_amount: 0.2,
      unit_extrude_amount: 1,
      floor_slab_extrude_amount: 0.1,
      wall_extrude_amount: 1.5,
      rebuild: ()=>{console.log('rebuild')},
      export_gltf: ()=>{console.log('export_gltf')}
    };
  }

  init()
  {
    document.addEventListener('keydown', event =>
    {
      if (event.shiftKey && event.key === 'K')
      {
        document.querySelector('.dg.ac').classList.toggle('hidden');
      }
    });
  }

  start()
  {
    this.dat_gui = new dat.GUI();

    document.querySelector('.dg.ac').style['z-index'] = 999;
    // document.querySelector('.dg.ac').classList.add('hidden');

    this.dat_gui.add(this.settings, 'unit_shrink_amount', 0, 2);
    this.dat_gui.add(this.settings, 'unit_extrude_amount', 0, 2);
    this.dat_gui.add(this.settings, 'floor_slab_extrude_amount', 0, 2);
    this.dat_gui.add(this.settings, 'wall_extrude_amount', 0, 2);
    this.dat_gui.add(this.settings, 'rebuild');
    this.dat_gui.add(this.settings, 'export_gltf');
    this.dat_gui.width = 400;
  }
}

export default new DatGUI();
