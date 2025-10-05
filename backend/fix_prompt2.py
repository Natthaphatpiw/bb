# Read file
with open('data_generator_multi_v2.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the prompt section and rebuild it
new_lines = []
skip_until = -1

for i, line in enumerate(lines):
    if skip_until > i:
        continue
    
    # Line 333: start of f-string prompt
    if i == 332 and 'prompt = f"""' in line:
        # Replace the entire prompt section
        new_lines.append('    # Build prompt with variables\n')
        new_lines.append('    current_price = market_data["current_price"]\n')
        new_lines.append('    price_change_pct = market_data["price_change_pct"]\n')
        new_lines.append('    unit = config["unit"]\n')
        new_lines.append('    name_th = config["name_th"]\n')
        new_lines.append('    name = config["name"]\n')
        new_lines.append('    \n')
        new_lines.append('    prompt_text = f"""You are a market intelligence analyst for {name_th} ({name}) markets.\n')
        new_lines.append('\n')
        new_lines.append('{dt_context["context_text"]}\n')
        new_lines.append('\n')
        new_lines.append('Current Market Data:\n')
        new_lines.append(f'Price: {{current_price:.2f}} {{unit}}\n')
        new_lines.append(f'Change: {{price_change_pct:+.2f}}%\n')
        new_lines.append('\n')
        new_lines.append('Price Forecasts:\n')
        new_lines.append('{json.dumps(price_forecasts["forecasts"], indent=2)}\n')
        new_lines.append('\n')
        new_lines.append('Top News (sorted by impact):\n')
        new_lines.append('{json.dumps(news_items[:10], indent=2)}\n')
        # Find where the prompt ends (at Task:)
        for j in range(i+1, len(lines)):
            if 'Task:' in lines[j]:
                new_lines.append('\n')
                new_lines.append('Task:\n')
                # Copy rest of prompt until """
                for k in range(j+1, len(lines)):
                    if '"""' in lines[k] and 'prompt' not in lines[k]:
                        new_lines.append('"""\n')
                        skip_until = k + 1
                        break
                    new_lines.append(lines[k])
                break
    else:
        new_lines.append(line)

with open('data_generator_multi_v2.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed!")
