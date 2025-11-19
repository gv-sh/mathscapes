/**
 * Noise Functions Module
 *
 * Comprehensive collection of noise functions for procedural generation,
 * creative coding, and generative art.
 */

// Perlin noise
export {
    PerlinNoise,
    perlin1D,
    perlin2D,
    perlin3D,
    perlin4D
} from './perlin';

// Simplex noise
export {
    SimplexNoise,
    simplex2D,
    simplex3D,
    simplex4D
} from './simplex';

// Worley/Cellular noise
export {
    WorleyNoise,
    DistanceMetric,
    worley2D,
    worley3D,
    cellular2D,
    cellular3D,
    cellEdge2D,
    cellEdge3D
} from './worley';

// Fractal noise (fBm, turbulence, etc.)
export {
    FractalNoise,
    NoiseType,
    FractalOptions,
    fbm2D,
    fbm3D,
    turbulence2D,
    turbulence3D,
    ridged2D,
    ridged3D
} from './fractal';

// Value noise
export {
    ValueNoise,
    value1D,
    value2D,
    value3D
} from './value';

// Gradient noise
export {
    GradientNoise,
    gradient2D,
    gradient3D
} from './gradient';

// Domain warping
export {
    NoiseFn2D,
    NoiseFn3D,
    DomainWarpOptions,
    domainWarp2D,
    domainWarp3D,
    recursiveDomainWarp2D,
    recursiveDomainWarp3D,
    flowField2D,
    flowField3D
} from './domainWarp';
