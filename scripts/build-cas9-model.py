#!/usr/bin/env python3
"""Builds models/cas9.glb, the 3D Cas9 shown in the hero, from a Protein Data Bank file.

    python3 scripts/build-cas9-model.py path/to/4oo8.pdb models/cas9.glb

Each chain becomes a smooth molecular surface: a Gaussian is placed on every heavy atom,
the sum is contoured with marching cubes, the mesh is smoothed and thinned, and the three
surfaces are written to one glTF binary with plain colours (protein white, guide RNA
Genome Gold, target DNA IGI Blue). Then compress it with Draco so it loads fast:

    npx gltf-pipeline -i models/cas9.glb -o models/cas9.glb -d --draco.compressionLevel 7

Needs: pip install numpy scipy scikit-image trimesh fast-simplification

The site uses entry 4OO8 (Nishimasu et al., Cell 2014): Cas9 with its guide RNA and the
target DNA strand, chains A, B and C. To show the DNA double helix reaching out of the
enzyme, use 5F9R (Jiang et al., Science 2016) instead, with chains A (Cas9), B (guide RNA),
C and D (the two DNA strands): pass "--chains A B CD" so both DNA strands share a colour."""
import argparse, os, numpy as np, trimesh
from skimage import measure

ap = argparse.ArgumentParser()
ap.add_argument('pdb'); ap.add_argument('out', nargs='?', default='models/cas9.glb')
ap.add_argument('--chains', nargs=3, default=['A', 'B', 'C'], metavar=('PROTEIN', 'RNA', 'DNA'),
                help='chain letters for the protein, the guide RNA and the DNA; several letters together share a surface')
a = ap.parse_args()

def parse(path, chains):
    atoms = {c: [] for c in chains}
    for line in open(path):
        if not line.startswith('ATOM'): continue
        ch = line[21]
        el = line[76:78].strip() or line[12:16].strip()[0]
        if el == 'H': continue
        for c in chains:
            if ch in c: atoms[c].append((float(line[30:38]), float(line[38:46]), float(line[46:54])))
    return {c: np.array(v, dtype=np.float64) for c, v in atoms.items()}

def gaussian_surface(xyz, sigma, iso, spacing):
    pad = 3 * sigma + 2
    lo = xyz.min(0) - pad; hi = xyz.max(0) + pad
    shape = np.ceil((hi - lo) / spacing).astype(int) + 1
    grid = np.zeros(shape, dtype=np.float32)
    r = int(np.ceil(3 * sigma / spacing))
    off = np.arange(-r, r + 1)
    ox, oy, oz = np.meshgrid(off, off, off, indexing='ij')
    for p in xyz:
        idx = np.round((p - lo) / spacing).astype(int)
        vx = (idx[0] + ox) * spacing + lo[0] - p[0]
        vy = (idx[1] + oy) * spacing + lo[1] - p[1]
        vz = (idx[2] + oz) * spacing + lo[2] - p[2]
        k = np.exp(-(vx * vx + vy * vy + vz * vz) / (2 * sigma * sigma))
        grid[idx[0]-r:idx[0]+r+1, idx[1]-r:idx[1]+r+1, idx[2]-r:idx[2]+r+1] += k.astype(np.float32)
    verts, faces, _, _ = measure.marching_cubes(grid, level=iso, spacing=(spacing,) * 3)
    return verts + lo, faces

def build(xyz, sigma, iso, spacing, faces_target, color, rough, name):
    v, f = gaussian_surface(xyz, sigma, iso, spacing)
    m = trimesh.Trimesh(v, f, process=True)
    parts = m.split(only_watertight=False)
    big = [p for p in parts if len(p.faces) > 0.02 * len(m.faces)]     # drop stray specks
    m = trimesh.util.concatenate(big) if big else m
    trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=12)
    if len(m.faces) > faces_target:
        m = m.simplify_quadric_decimation(face_count=faces_target)
    m.fix_normals()
    m.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
        name=name, baseColorFactor=color, metallicFactor=0.0, roughnessFactor=rough))
    m.metadata['name'] = name
    print(f'{name}: {len(xyz)} atoms, {len(m.faces)} faces')
    return m

protein_c, rna_c, dna_c = a.chains
atoms = parse(a.pdb, [protein_c, rna_c, dna_c])
center = np.vstack(list(atoms.values())).mean(0)
for c in atoms: atoms[c] -= center
meshes = [
    build(atoms[protein_c], 1.7, 0.85, 0.9, 110000, [236, 237, 243, 255], 0.62, 'Cas9'),
    build(atoms[rna_c],     1.4, 0.75, 0.8, 40000,  [255, 172, 15, 255],  0.5,  'guide RNA'),
    build(atoms[dna_c],     1.4, 0.75, 0.8, 24000,  [88, 87, 255, 255],   0.5,  'target DNA'),
]
scene = trimesh.Scene()
for m in meshes: scene.add_geometry(m, node_name=m.metadata['name'], geom_name=m.metadata['name'])
scene.export(a.out)
print('wrote', a.out, round(os.path.getsize(a.out) / 1e6, 2), 'MB (uncompressed; run gltf-pipeline for the Draco version)')
