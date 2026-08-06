// Package consensus implements high-performance Go routines for Polygon AggLayer LxLy Exit Tree synchronization
// and double-spend nullifier validation across connected ZK-Rollups.
package consensus

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"sync"
	"time"
)

var (
	ErrInvalidRootLength   = errors.New("agglayer: invalid exit root length, expected 32 bytes")
	ErrMerkleRootMismatch  = errors.New("agglayer: computed merkle root does not match committed L1 root")
	ErrRollupAlreadySynced = errors.New("agglayer: rollup batch ID already synced in state tree")
)

type LxLyMerkleValidator struct {
	mu             sync.RWMutex
	L1Commitments  map[uint32][]byte
	SyncedBatches  map[uint32]bool
	LastSyncTime   time.Time
	TotalValidated uint64
}

// NewLxLyMerkleValidator initializes a new consensus validator node instance.
func NewLxLyMerkleValidator() *LxLyMerkleValidator {
	return &LxLyMerkleValidator{
		L1Commitments: make(map[uint32][]byte),
		SyncedBatches: make(map[uint32]bool),
		LastSyncTime:  time.Now().UTC(),
	}
}

// CommitL1ExitRoot stores a verified L1 exit root for an AggLayer CDK rollup chain.
func (v *LxLyMerkleValidator) CommitL1ExitRoot(rollupID uint32, root []byte) error {
	if len(root) != 32 {
		return ErrInvalidRootLength
	}
	v.mu.Lock()
	defer v.mu.Unlock()

	v.L1Commitments[rollupID] = root
	v.LastSyncTime = time.Now().UTC()
	return nil
}

// ValidateCrossChainProof computes the Merkle root from siblings and verifies against L1 state.
func (v *LxLyMerkleValidator) ValidateCrossChainProof(
	rollupID uint32,
	batchID uint32,
	leafHash []byte,
	siblings [][]byte,
) (bool, error) {
	v.mu.Lock()
	defer v.mu.Unlock()

	if v.SyncedBatches[batchID] {
		return false, ErrRollupAlreadySynced
	}

	expectedRoot, exists := v.L1Commitments[rollupID]
	if !exists {
		return false, fmt.Errorf("agglayer: no L1 commitment found for rollup %d", rollupID)
	}

	computed := leafHash
	for _, sibling := range siblings {
		hash := sha256.Sum256(append(computed, sibling...))
		computed = hash[:]
	}

	if string(computed) != string(expectedRoot) {
		return false, ErrMerkleRootMismatch
	}

	v.SyncedBatches[batchID] = true
	v.TotalValidated++
	v.LastSyncTime = time.Now().UTC()

	return true, nil
}
