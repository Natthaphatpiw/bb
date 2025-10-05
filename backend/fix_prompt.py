# Fix the prompt string issue
with open('data_generator_multi_v2.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix line 329 (the prompt assignment)
for i in range(len(lines)):
    if i == 328:  # Line 329 (0-indexed at 328)
        # Change from regular string to f-string
        lines[i] = f'    prompt = f"""You are a market intelligence analyst for {{config["name_th"]}} ({{config["name"]}}) markets.\n'
    elif i == 333:  # Line 334
        lines[i] = '- Price: {market_data["current_price"]:.2f} {config["unit"]}\n'
    elif i == 334:  # Line 335  
        lines[i] = '- Change: {market_data["price_change_pct"]:+.2f}%\n'
    elif i == 337:  # Line 338
        lines[i] = '{json.dumps(price_forecasts["forecasts"], indent=2)}\n'
    elif i == 340:  # Line 341
        lines[i] = '{json.dumps(news_items[:10], indent=2)}\n'
    elif i == 350:  # Line 351
        lines[i] = '5. ourRecommendedAction: SPECIFIC action with EXACT DATES (use TODAY\'s date {dt_context["date"]} as reference)\n'

with open('data_generator_multi_v2.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed!")
