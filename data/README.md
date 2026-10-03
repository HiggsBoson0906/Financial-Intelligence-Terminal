# Data Directory

This directory contains the datasets used by the Financial Intelligence Terminal.

- `raw/`: Contains original downloaded datasets. These files must remain immutable.
- `processed/`: Contains cleaned and engineered datasets ready for modeling and analysis.

## Important Rules

1. **Do Not Commit Data:** Data files themselves must not be committed to Git. They are ignored in the `.gitignore`.
2. **Immutability:** Raw data should remain immutable. Any transformations must be saved to the `processed/` directory.
3. **Provenance:** Provenance should eventually include:
   - source
   - URL
   - download date
   - version
   - transformations
4. **Data Integrity:** Never fabricate missing values. Ensure data transformations are accurately documented.
