import Layout from "@/components/Layout";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { withSwal } from 'react-sweetalert2';
function Categories({swal}){ 
   const [name,setName] = useState('');
const [categories,setCategories] = useState([]);
const [parentCategory,setParentCategory] = useState('');
const [editedCategory, setEditedCategory] = useState(null);
const [goToProducts,setGoToProducts] = useState(false);
useEffect(() => {
  
  axios.get('/api/categories').then(result=>{
      setCategories(result.data);
  });
}, []);
function deleteCategory(category){
  swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete ${category.name}?`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Yes, Delete!',
    confirmButtonColor: '#d55',
    reverseButtons: true,
  }).then(async result => {
    if (result.isConfirmed) {
      const {_id} = category;
      await axios.delete('/api/categories?_id='+_id);
      fetchCategories();
    }
  });
}
async function saveProduct(ev) {
  ev.preventDefault();
  const data = {
    title,description,price,category,
    properties:productProperties
  };
  if (_id) {
    //update
    await axios.put('/api/products', {...data,_id});
  } else {
    //create
    await axios.post('/api/products', data);
  }
  setGoToProducts(true);
}
if (goToProducts) {
  router.push('/products');
}
async function saveCategory(ev){
  ev.preventDefault();
  const data = {
    name,
    parentCategory,
  
  };
  if (editedCategory) {
    data._id = editedCategory._id;
    await axios.put('/api/categories', data);
    setEditedCategory(null);
  } else {
    await axios.post('/api/categories', data);
  }
  setName('');
  setParentCategory('');
  
  fetchCategories();
}
function fetchCategories() {
  axios.get('/api/categories').then(result => {
    setCategories(result.data);
  });
}
function editCategory(category){
  setEditedCategory(category);
  setName(category.name);
  setParentCategory(category.parent?._id);
 
}

  return(
      <Layout>
          <h1>Categories</h1>
          <label>{editedCategory ? 'Edit category ':' CREATE New category Name'} </label>
          <form onSubmit={saveCategory} className="flex gap-1">
          <input type="text" className="border-2 border-grey-300 rounded-md px-1 w-full" 
          placeholder={'Category name'}
          onChange={ev => setName(ev.target.value)}
          value={name}/>
          <select  onChange={ev => setParentCategory(ev.target.value)} className="border-2 border-gray-300 rounded-md px-1 w-full border-blue-900 mb-0"
           value={parentCategory} >
              <option  value=''>No parent category</option>
              {categories.length > 0 && categories.map(category => (
          <option value={category._id}>{category.name}</option>
        ))}
          </select>
          <button  type="submit"className="px-4 py-1 text-white rounded-md mb-0 rounded-sm bg-blue-900">Save</button>
          </form>
          <table className="w-full mt-4">
              <thead className="bg-blue-100">
                  <tr className="border border-blue-300 p-1">
                      <td className="border border-blue-300 p-1">Category Name </td>
                      <td>Parent Category</td>
                      <td></td>
                  </tr>
              </thead>
              <tbody>
              {categories.length > 0 && categories.map(category => (
          <tr key={category._id}>
            <td>{category.name}</td>
            <td>{category?.parent?.name}</td>
            <td>
              
              <button 
               onClick={()=> editCategory(category)} className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900 mr-1">Edit</button>
              <button className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900" onClick={()=>deleteCategory(category)}>Delete</button>
            </td>
            
          </tr>
        ))}
              </tbody>
              
          </table>
      </Layout>
  );
  
}
export default withSwal(({swal}, ref) => (
  <Categories swal={swal} />
));
