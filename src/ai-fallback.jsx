import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Modal} from './shared.jsx';

function GeneratedRecipe({recipe,onClose}){
  return <Modal title={recipe.name} onClose={onClose}><div className="two-col"><div><p className="eyebrow">GEMINI RECIPE IDEA</p><p>{recipe.description||'A suggested home-cooking recipe based on your search.'}</p><div className="facts"><div><small>CATEGORY</small><b>{recipe.category||'Recipe'}</b></div><div><small>CUISINE</small><b>{recipe.cuisine||'Flexible'}</b></div><div><small>PREP</small><b>{recipe.prepTime||'—'}</b></div><div><small>COOK</small><b>{recipe.cookTime||'—'}</b></div></div><p className="footnote">AI-generated recipe idea. Check ingredient labels, portions, allergies and safe cooking temperatures before preparing it. Nutrition has not been calculated.</p></div><div><h3>Ingredients · {recipe.servings||'—'} servings</h3><div className="ingredient-table">{recipe.ingredients.map((item,index)=><div key={index}><strong>{item.amount} · {item.name}</strong></div>)}</div><h3>Method</h3><ol className="instructions">{recipe.instructions.map((step,index)=><li key={index}>{step}</li>)}</ol></div></div></Modal>
}

function AiRecipeFallback(){
  const [query,setQuery]=useState(''),[recipe,setRecipe]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[open,setOpen]=useState(false);
  const requested=useRef('');
  useEffect(()=>{
    const check=()=>{
      const input=document.querySelector('input[list="recipe-suggestions"]');
      const empty=[...document.querySelectorAll('.live-recipes .empty-state')].find(node=>node.textContent.includes('No live recipes found'));
      const host=document.getElementById('ai-recipe-fallback');
      if(host){host.hidden=!empty;if(empty&&host.previousElementSibling!==empty)empty.after(host)}
      if(empty&&input?.value.trim().length>=2)setQuery(input.value.trim());
      if(!empty)setQuery('');
    };
    const observer=new MutationObserver(check);observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('input',check);check();
    return()=>{observer.disconnect();document.removeEventListener('input',check)};
  },[]);
  useEffect(()=>{
    if(!query||requested.current===query)return;
    requested.current=query;setRecipe(null);setError('');setLoading(true);
    fetch('/api/recipes/ai-fallback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'AI recipe generation failed.');return data}).then(data=>setRecipe(data.recipe)).catch(error=>setError(error.message)).finally(()=>setLoading(false));
  },[query]);
  if(!query)return null;
  return <section className="live-recipes ai-recipe-fallback"><div className="split"><div><p className="eyebrow">AI RECIPE FALLBACK</p><h2>Suggested recipe for “{query}”</h2></div><span className="tag">Gemini</span></div>{loading&&<p className="muted">Creating a recipe idea…</p>}{error&&<p className="error">{error}</p>}{recipe&&<article className="panel"><p className="eyebrow">{recipe.category||'RECIPE'}{recipe.cuisine&&' · '+recipe.cuisine}</p><h3>{recipe.name}</h3><p className="muted">{recipe.description||'A practical recipe idea generated from your search.'}</p><div className="row"><span>{recipe.prepTime||'—'} prep · {recipe.cookTime||'—'} cook</span><button className="primary" onClick={()=>setOpen(true)}>View recipe →</button></div></article>}{open&&<GeneratedRecipe recipe={recipe} onClose={()=>setOpen(false)}/>}</section>;
}

const host=document.createElement('div');host.id='ai-recipe-fallback';host.hidden=true;document.body.append(host);createRoot(host).render(<AiRecipeFallback/>);
