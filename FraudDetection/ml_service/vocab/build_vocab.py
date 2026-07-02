import pandas as pd
import json

train_path = "processed_fraudTrain.csv"
test_path = "processed_fraudTest.csv"

df_train = pd.read_csv(train_path)
df_test = pd.read_csv(test_path)

combined_df = pd.concat(
    [
        df_train[['trans_hour', 'category']],
        df_test[['trans_hour', 'category']]
    ],
    ignore_index=True
)

hour_to_idx = {
    hour: idx
    for idx, hour in enumerate(
        sorted(combined_df['trans_hour'].unique())
    )
}

category_to_idx = {
    category: idx
    for idx, category in enumerate(
        sorted(combined_df['category'].unique())
    )
}

with open("hour_to_idx.json", "w") as f:
    json.dump(hour_to_idx, f)

with open("category_to_idx.json", "w") as f:
    json.dump(category_to_idx, f)

print("Vocabulary saved.")