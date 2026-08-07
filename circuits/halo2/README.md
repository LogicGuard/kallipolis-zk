# Halo2 Proof Engine: Kallipolis Recursive Polynomial Circuit Systems

## Overview

This directory contains the **Halo2** (PLONKish arithmetization with KZG / IPA commitments) recursive circuits for Kallipolis ZK. These circuits construct zero-knowledge validity proofs for batch state transitions across the Polygon AggLayer bridge.

---

## Arithmetization & Mathematical Specification

### 1. PLONKish Gate Formulation

The custom gate constraint for the Kallipolis State Transition Validator on a 2D matrix layout of columns $q_L, q_R, q_O, q_M, q_C \in \mathbb{F}^n$ is defined as:

$$
q_{L,i} \cdot w_{L,i} + q_{R,i} \cdot w_{R,i} + q_{O,i} \cdot w_{O,i} + q_{M,i} \cdot (w_{L,i} \cdot w_{R,i}) + q_{C,i} + q_{range,i} \cdot \text{RangeCheck}_{16}(w_{L,i}) = 0
$$

Where $w_{L}, w_{R}, w_{O}$ are advice columns for Left, Right, and Output wires at row $i$.

---

### 2. Custom Multi-Slippage Lookup Argument

We define a 3-way lookup table $\mathcal{T}$ for verifying valid DEX liquidity invariant curve points $(x, y, k)$ such that:

$$
(x_i - \Delta x) \cdot (y_i + \gamma \Delta y) \ge k_0
$$

The Halo2 lookup argument enforces equality of multiset valuations using Permutation Polynomial $Z(X)$ over domain $H = \{\omega^0, \omega^1, \dots, \omega^{n-1}\}$:

$$
Z(\omega X) \cdot (A(X) + \beta) \cdot (B(X) + \gamma) - Z(X) \cdot (A'(X) + \beta) \cdot (B'(X) + \gamma) = 0
$$

Where:
- $A(X) = f(X) + \beta \cdot g(X)$ (Compressed lookup expression)
- $B(X) = t(X) + \beta \cdot t' (X)$ (Compressed table expression)

---

### 3. Recursive Proof Accumulation Scheme (IPA / KZG)

To aggregate $M$ frame proofs $\pi_1, \dots, \pi_M$ into a single AggLayer submission proof $\Pi_{Agg}$:

Given polynomial commitment $C = [p(X)]$ and evaluation point $z$, the opening proof constraint satisfies:

$$
W(X) = \frac{p(X) - p(z)}{X - z}
$$

The accumulator updates state vector $U_k = (E_k, [u]_k)$ via inner product argument over BN254 / Pasta curves:

$$
E_{k+1} = E_k + r \cdot \text{Commit}(q_{k+1}), \quad r \leftarrow \text{Fiat-Shamir}(\text{Transcript})
$$

---

## Verification Polynomial Boundary Conditions

$$
L_1(X) \cdot (Z(X) - 1) = 0 \quad (\text{Enforces } Z(\omega^0) = 1)
$$

$$
(X - \omega^{n-1}) \cdot \Big( Z(\omega X) \cdot P_{\text{lookup}}(X) - Z(X) \cdot Q_{\text{lookup}}(X) \Big) = 0
$$

---

## Execution & Verification Workflow

```rust
use halo2_proofs::{
    arithmetic::Field,
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Advice, Circuit, Column, ConstraintSystem, Error, Selector},
    poly::Rotation,
};

// Execute Halo2 MockProver test suite
cargo test --package kallipolis-halo2-circuits --lib -- --nocapture
```

---

## Performance Matrix

| Component | Metric | Value |
| :--- | :--- | :--- |
| **K-Degree Domain** | $2^{17}$ | $131,072\text{ rows}$ |
| **Advice Columns** | Plonk Wires | $10\text{ Advice}, 3\text{ Instance}, 5\text{ Fixed}$ |
| **Proof System** | Commitment Scheme | KZG over BN254 / Halo2 IPA |
| **Aggregation Latency** | Batch size $M = 64$ | $340\text{ ms}$ |
