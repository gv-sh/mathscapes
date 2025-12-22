# Statistics Module

Comprehensive statistical computing for JavaScript/TypeScript. This module provides functions for descriptive statistics, correlation analysis, and time series operations.

## Features

### Descriptive Statistics

- **Central Tendency**: mean, median, mode, trimmed mean
- **Dispersion**: variance, standard deviation, MAD, IQR, range
- **Distribution Shape**: skewness, kurtosis
- **Quantiles**: percentiles, quartiles, five-number summary

### Correlation & Covariance

- **Correlation Measures**: Pearson, Spearman, Kendall tau
- **Covariance**: sample and population covariance
- **Matrix Operations**: covariance matrix, correlation matrix
- **Partial Correlation**: controlling for confounding variables
- **Autocorrelation**: for time series analysis

### Time Series Statistics

- **Rolling Statistics**: mean, variance, std dev, min, max, sum
- **Exponentially Weighted**: EWMA, EWM variance, EWM std dev
- **Cumulative Statistics**: sum, product, min, max

## Installation

```bash
npm install mathscapes
```

## Usage

### Basic Descriptive Statistics

```typescript
import { mean, median, standardDeviation, summary } from 'mathscapes/stats';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Calculate individual statistics
console.log('Mean:', mean(data)); // 5.5
console.log('Median:', median(data)); // 5.5
console.log('Std Dev:', standardDeviation(data)); // ~3.03

// Get comprehensive statistics at once
const stats = summary(data);
console.log(stats);
// {
//   count: 10,
//   mean: 5.5,
//   std: 3.03,
//   min: 1,
//   q1: 3.25,
//   median: 5.5,
//   q3: 7.75,
//   max: 10,
//   variance: 9.17,
//   skewness: 0,
//   kurtosis: -1.2,
//   range: 9,
//   iqr: 4.5
// }
```

### Correlation Analysis

```typescript
import {
  pearsonCorrelation,
  spearmanCorrelation,
  kendallTau,
  covarianceMatrix,
} from 'mathscapes/stats';

const x = [1, 2, 3, 4, 5];
const y = [2, 4, 6, 8, 10];

// Pearson correlation (measures linear relationship)
console.log(pearsonCorrelation(x, y)); // 1.0 (perfect positive correlation)

// Spearman correlation (measures monotonic relationship)
console.log(spearmanCorrelation(x, y)); // 1.0

// Kendall's tau (rank-based correlation)
console.log(kendallTau(x, y)); // 1.0

// Covariance matrix for multiple variables
const data = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const covMatrix = covarianceMatrix(data);
console.log(covMatrix);
```

### Time Series Analysis

```typescript
import {
  rollingMean,
  rollingStdDev,
  ewma,
  cumulativeSum,
} from 'mathscapes/stats';

const timeSeries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Rolling (moving) mean with window size 3
const rolling = rollingMean(timeSeries, 3);
console.log(rolling);
// [NaN, NaN, 2, 3, 4, 5, 6, 7, 8, 9]

// Rolling standard deviation
const rollingStd = rollingStdDev(timeSeries, 3);

// Exponentially weighted moving average
const smoothed = ewma(timeSeries, 0.5);
console.log(smoothed);
// [1, 1.5, 2.25, 3.125, 4.0625, ...]

// Cumulative sum
const cumSum = cumulativeSum(timeSeries);
console.log(cumSum);
// [1, 3, 6, 10, 15, 21, 28, 36, 45, 55]
```

### Advanced Examples

#### Quantile Analysis

```typescript
import { quantile, percentile, fiveNumberSummary } from 'mathscapes/stats';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Calculate specific quantiles
console.log(quantile(data, 0.25)); // First quartile (Q1)
console.log(quantile(data, 0.75)); // Third quartile (Q3)

// Percentiles (0-100 scale)
console.log(percentile(data, 95)); // 95th percentile

// Five-number summary (min, Q1, median, Q3, max)
const summary = fiveNumberSummary(data);
console.log(summary);
// { min: 1, q1: 3.25, median: 5.5, q3: 7.75, max: 10 }
```

#### Trimmed Mean (Robust to Outliers)

```typescript
import { mean, trimmedMean } from 'mathscapes/stats';

const dataWithOutliers = [1, 2, 3, 4, 5, 100];

console.log(mean(dataWithOutliers)); // 19.17 (affected by outlier)
console.log(trimmedMean(dataWithOutliers, 0.2)); // 3.5 (robust)
```

#### Distribution Shape Analysis

```typescript
import { skewness, kurtosis } from 'mathscapes/stats';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Skewness (asymmetry of distribution)
// Positive: right-skewed, Negative: left-skewed, ~0: symmetric
console.log(skewness(data)); // ~0 (symmetric)

// Kurtosis (tailedness of distribution)
// Positive: heavy tails, Negative: light tails, ~0: normal
console.log(kurtosis(data)); // ~-1.2 (platykurtic)
```

#### Partial Correlation

```typescript
import { partialCorrelation } from 'mathscapes/stats';

// Calculate correlation between X and Y, controlling for Z
const data = [
  [1, 2, 1], // [X, Y, Z]
  [2, 3, 2],
  [3, 4, 3],
  [4, 5, 4],
];

const partialCorr = partialCorrelation(data);
console.log(partialCorr); // Correlation between X and Y after removing Z's effect
```

#### Time Series Smoothing

```typescript
import { ewma, ewmStdDev } from 'mathscapes/stats';

const noisyData = [1, 3, 2, 4, 3, 5, 4, 6, 5, 7];

// Smooth with exponentially weighted moving average
// Higher alpha = more weight to recent data
const smoothed = ewma(noisyData, 0.3);

// Or use span (span = 10 ≈ alpha = 0.18)
const smoothedBySpan = ewma(noisyData, undefined, 10);

// Track volatility with exponentially weighted std dev
const volatility = ewmStdDev(noisyData, 0.3);
```

#### Rolling Window Analysis

```typescript
import {
  rollingMin,
  rollingMax,
  rollingMean,
} from 'mathscapes/stats';

const prices = [100, 102, 101, 105, 103, 107, 106, 110];

// Track support and resistance levels
const support = rollingMin(prices, 5);
const resistance = rollingMax(prices, 5);
const movingAvg = rollingMean(prices, 5);

console.log('Support:', support);
console.log('Resistance:', resistance);
console.log('Moving Avg:', movingAvg);
```

## API Reference

### Descriptive Statistics

#### Central Tendency

- `mean(data: number[]): number` - Arithmetic mean
- `median(data: number[]): number` - Median value
- `mode(data: number[]): number[]` - Most frequent values
- `trimmedMean(data: number[], trimProportion?: number): number` - Mean with extreme values trimmed

#### Dispersion

- `variance(data: number[], sample?: boolean): number` - Variance
- `standardDeviation(data: number[], sample?: boolean): number` - Standard deviation
- `medianAbsoluteDeviation(data: number[]): number` - Median absolute deviation (MAD)
- `interquartileRange(data: number[]): number` - IQR (Q3 - Q1)
- `range(data: number[]): number` - Range (max - min)

#### Distribution Shape

- `skewness(data: number[], sample?: boolean): number` - Skewness coefficient
- `kurtosis(data: number[], sample?: boolean, excess?: boolean): number` - Kurtosis coefficient

#### Quantiles

- `quantile(data: number[], p: number): number` - Calculate quantile (0-1)
- `percentile(data: number[], p: number): number` - Calculate percentile (0-100)
- `quantiles(data: number[], quantiles: number[]): number[]` - Multiple quantiles
- `fiveNumberSummary(data: number[]): object` - Min, Q1, median, Q3, max

#### Summary

- `summary(data: number[]): object` - Comprehensive statistics summary

### Correlation & Covariance

- `covariance(x: number[], y: number[], sample?: boolean): number` - Covariance
- `pearsonCorrelation(x: number[], y: number[]): number` - Pearson correlation
- `spearmanCorrelation(x: number[], y: number[]): number` - Spearman rank correlation
- `kendallTau(x: number[], y: number[]): number` - Kendall's tau
- `covarianceMatrix(data: number[][], sample?: boolean): number[][]` - Covariance matrix
- `correlationMatrix(data: number[][]): number[][]` - Correlation matrix
- `partialCorrelation(data: number[][]): number` - Partial correlation
- `autocorrelation(data: number[], lag: number): number` - Autocorrelation

### Time Series

#### Rolling Statistics

- `rollingMean(data: number[], windowSize: number, center?: boolean): number[]`
- `rollingVariance(data: number[], windowSize: number, center?: boolean, sample?: boolean): number[]`
- `rollingStdDev(data: number[], windowSize: number, center?: boolean, sample?: boolean): number[]`
- `rollingMin(data: number[], windowSize: number, center?: boolean): number[]`
- `rollingMax(data: number[], windowSize: number, center?: boolean): number[]`
- `rollingSum(data: number[], windowSize: number, center?: boolean): number[]`

#### Exponentially Weighted

- `ewma(data: number[], alpha?: number, span?: number, adjust?: boolean): number[]`
- `ewmVariance(data: number[], alpha?: number, span?: number, adjust?: boolean): number[]`
- `ewmStdDev(data: number[], alpha?: number, span?: number, adjust?: boolean): number[]`

#### Cumulative

- `cumulativeSum(data: number[]): number[]`
- `cumulativeProduct(data: number[]): number[]`
- `cumulativeMin(data: number[]): number[]`
- `cumulativeMax(data: number[]): number[]`

## Mathematical Background

### Pearson vs Spearman vs Kendall

- **Pearson**: Measures linear relationships, sensitive to outliers
- **Spearman**: Measures monotonic relationships, robust to outliers
- **Kendall**: Based on concordant/discordant pairs, more robust than Spearman

### Sample vs Population Statistics

- **Sample** (n-1): Used when data is a sample from a larger population
- **Population** (n): Used when data represents the entire population

### Skewness Interpretation

- **Positive**: Right tail is longer (mean > median)
- **Negative**: Left tail is longer (mean < median)
- **Zero**: Symmetric distribution

### Kurtosis Interpretation

- **Excess > 0**: Heavy tails (leptokurtic) - more outliers
- **Excess < 0**: Light tails (platykurtic) - fewer outliers
- **Excess ≈ 0**: Normal distribution (mesokurtic)

## Performance Notes

- Most functions have O(n) time complexity
- Sorting operations (median, quantiles) are O(n log n)
- Kendall's tau is O(n²) for the naive implementation
- Rolling statistics use sliding windows for efficiency

## License

MIT

## Contributing

Contributions are welcome! Please see the main repository for guidelines.
