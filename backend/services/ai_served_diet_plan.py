import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve the API key from an environment variable
api_key = os.environ.get("GOOGLE_API_KEY", "AIzaSyD_9oqsnMEgT_9Vx2-BH0LKcAwTdlC8jmE")
if not api_key:
    raise ValueError("API key not found. Please set the GOOGLE_API_KEY environment variable.")

genai.configure(api_key=api_key)

# Choose a model
model = genai.GenerativeModel("gemini-2.5-flash")

def generate_meal_suggestions(user_input: dict) -> dict:
    """
    Calls Gemini and returns a dict diet plan (no printing here).
    """
    prompt_template = f"""
    Given the following user data:
    Age: {user_input['age']}
    Gender: {user_input['gender']}
    Height: {user_input['height_cm']} cm
    Weight: {user_input['weight_kg']} kg
    Activity Level: {user_input['activity_level']}
    Goal: {user_input['goal']}
    Medical Conditions: {', '.join(user_input['medical_conditions'])}
    Food Restrictions: {', '.join(user_input['food_restrictions'])}
    Food Preferences: {', '.join(user_input['food_preferences'])}

    Generate a 30-day diet plan in the exact format of a Python dictionary. The dictionary should have 'Day 1' through 'Day 30' as keys. Each day should be a dictionary with keys 'Breakfast', 'Lunch', 'Dinner', and 'Snacks'. Each meal should be a list of strings (meal should be Bangladeshi cuisine from the bangladeshi_foods_100g.csv file), with each string representing a food item and its quantity (e.g., 'Rice (brown, raw): 60g'). The diet plan must be nutritionally balanced and suitable for the user's data, especially considering their goal and medical conditions like hypertension and food restrictions like no_beef. The output must be a valid JSON object. Do not include any text before or after the JSON.
    """.strip()
    print("Got it. Generating diet plan...")

    response = model.generate_content(prompt_template)
    print("Got it. Response received.")
    response_text = response.text.strip()
    clean_response = response_text.replace("```json\n", "").replace("```", "")
    # Parse JSON strictly
    diet_plan_dict = json.loads(clean_response)
    return diet_plan_dict


# if __name__ == '__main__':
#     # Get user input
#     age = int(input("Enter age: "))
#     gender = input("Enter your gender: ")
#     height_cm = float(input("Enter height in cm: "))
#     weight_kg = float(input("Enter weight in kg: "))
#     activity_level = input("Enter activity level (sedentary, lightly active, moderately active, very active): ")
#     goal = input("Enter your goal (weight loss, weight gain, muscle gain, maintain weight): ")
#
#     medical_conditions_input = input("Enter any medical conditions (comma-separated, e.g., hypertension, diabetes) or 'none': ")
#     medical_conditions = medical_conditions_input.split(', ') if medical_conditions_input.strip().lower() != 'none' else []
#
#     food_restrictions_input = input("Enter any food restrictions (comma-separated, e.g., no_beef, vegetarian) or 'none': ")
#     food_restrictions = food_restrictions_input.split(', ') if food_restrictions_input.strip().lower() != 'none' else []
#
#     food_preferences_input = input("Enter any food preferences (comma-separated, e.g., spicy, sweet) or 'none': ")
#     food_preferences = food_preferences_input.split(', ') if food_preferences_input.strip().lower() != 'none' else []
#
#     user_data = {
#         "age": age,
#         "gender": gender,
#         "height_cm": height_cm,
#         "weight_kg": weight_kg,
#         "activity_level": activity_level,
#         "goal": goal,
#         "medical_conditions": medical_conditions,
#         "food_restrictions": food_restrictions,
#         "food_preferences": food_preferences,
#     }
#
#     diet_plan = generate_meal_suggestions(user_data)
#
#     print("Diet Plan: \n", diet_plan)
