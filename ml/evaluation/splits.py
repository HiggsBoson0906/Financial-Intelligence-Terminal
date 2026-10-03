import pandas as pd
import numpy as np
from typing import Tuple, List

def create_event_grouped_chronological_splits(
    df: pd.DataFrame, 
    event_col: str = 'event_id', 
    date_col: str = 'event_date', 
    train_prop: float = 0.7, 
    val_prop: float = 0.15
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Creates strictly chronological splits while ensuring all assets for a single event
    stay in the same split (no cross-leakage of events).
    """
    # 1. Get unique events and sort them chronologically by their earliest date
    event_dates = df.groupby(event_col)[date_col].min().sort_values()
    
    unique_events = event_dates.index.tolist()
    total_events = len(unique_events)
    
    # 2. Determine split indices
    train_end_idx = int(total_events * train_prop)
    val_end_idx = train_end_idx + int(total_events * val_prop)
    
    train_events = set(unique_events[:train_end_idx])
    val_events = set(unique_events[train_end_idx:val_end_idx])
    test_events = set(unique_events[val_end_idx:])
    
    # Validation/Sanity checks on event lists
    assert train_events.isdisjoint(val_events), "Leakage: Train/Val overlap"
    assert val_events.isdisjoint(test_events), "Leakage: Val/Test overlap"
    assert train_events.isdisjoint(test_events), "Leakage: Train/Test overlap"
    
    # 3. Filter original dataframe
    train_df = df[df[event_col].isin(train_events)].copy()
    val_df = df[df[event_col].isin(val_events)].copy()
    test_df = df[df[event_col].isin(test_events)].copy()
    
    # Check chronological purge window (no train date should be > any val date, and val date > test date)
    if not train_df.empty and not val_df.empty:
        max_train_date = train_df[date_col].max()
        min_val_date = val_df[date_col].min()
        assert max_train_date <= min_val_date, f"Purge violation: max_train ({max_train_date}) > min_val ({min_val_date})"
        
    if not val_df.empty and not test_df.empty:
        max_val_date = val_df[date_col].max()
        min_test_date = test_df[date_col].min()
        assert max_val_date <= min_test_date, f"Purge violation: max_val ({max_val_date}) > min_test ({min_test_date})"
    
    return train_df, val_df, test_df

