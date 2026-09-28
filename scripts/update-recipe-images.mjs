import fs from 'node:fs';

const file=new URL('../data/recipes.json',import.meta.url);
const recipes=JSON.parse(fs.readFileSync(file,'utf8'));
const categories=['Breakfast','Chicken','Beef','Seafood','Vegetarian','Pasta','Dessert','Side','Miscellaneous'];
const pools={};
for(const category of categories){
  const response=await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
  if(!response.ok)throw Error(`Unable to load ${category} photos.`);
  pools[category]=(await response.json()).meals||[];
}
const used=new Set(),all=Object.values(pools).flat();
function poolFor(recipe){
  const text=[recipe.name,...recipe.ingredients.map(x=>x.name)].join(' ').toLowerCase();
  if(/chicken|turkey/.test(text))return 'Chicken';
  if(/beef|steak/.test(text))return 'Beef';
  if(/salmon|tuna|tilapia|shrimp|fish|cod/.test(text))return 'Seafood';
  if(/pasta|noodle|spaghetti/.test(text))return 'Pasta';
  if(recipe.category==='Breakfast')return 'Breakfast';
  if(recipe.category==='Dessert')return 'Dessert';
  if(recipe.category==='Sauces & Dressings')return 'Side';
  if(/tofu|lentil|bean|chickpea|vegetable|quinoa/.test(text))return 'Vegetarian';
  return recipe.category==='Dinner'?'Miscellaneous':'Vegetarian';
}
for(const [index,recipe] of recipes.entries()){
  const preferred=pools[poolFor(recipe)]||all;
  let meal=preferred.find(x=>!used.has(x.idMeal))||all.find(x=>!used.has(x.idMeal));
  if(!meal)meal=preferred[index%preferred.length];
  if(!meal)continue;
  used.add(meal.idMeal);
  recipe.imageFallback=recipe.imageFallback||recipe.image;
  recipe.image=meal.strMealThumb;
  recipe.imageAttribution={source:'TheMealDB',url:`https://www.themealdb.com/meal/${meal.idMeal}`,title:meal.strMeal};
}
fs.writeFileSync(file,JSON.stringify(recipes,null,2)+'\n');
console.log(`Updated ${recipes.length} recipes with ${used.size} distinct meal photos.`);
