import Layout from "@/components/Layout";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { withSwal } from 'react-sweetalert2';
import { useRouter } from 'next/router';


function Categories({ swal }) {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState('');
  const [editedCategory, setEditedCategory] = useState(null);
  const [goToProducts, setGoToProducts] = useState(false);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    });
  }, []);

  function handlePropertyNameChange(index,property,newName) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  
  

  function deleteCategory(category) {
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
        const { _id } = category;
        await axios.delete('/api/categories?_id=' + _id);
        fetchCategories();
      }
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties(prev => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  function addProperty() {
    setProperties(prev => {
      return [...prev, { name: '', values: '' }];
    });
  }

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      category,
      properties: productProperties
    };
    if (_id) {
      //update
      await axios.put('/api/products', { ...data, _id });
    } else {
      //create
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push('/products');
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name,
      parentCategory,properties:properties.map(p => ({
        name:p.name,
        values:p.values.split(','),
      })),
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
    setProperties([]);
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
    setProperties(
      category.properties.map(({name,values}) => ({
      name,
      values:values.join(',')
    }))
    );
  }
  return (
    <Layout>
      <h1>Categories</h1>
      <label>{editedCategory ? 'Edit category ' : 'CREATE New category Name'}</label>
      <form onSubmit={saveCategory} className="flex gap-1">
        <input
          type="text"
          className="border-2 border-grey-300 rounded-md px-1 w-full"
          placeholder={'Category name'}
          onChange={ev => setName(ev.target.value)}
          value={name}
        />
        <select
          onChange={ev => setParentCategory(ev.target.value)}
          className="border-2 border-gray-300 rounded-md px-1 w-full border-blue-900 mb-0"
          value={parentCategory}
        >
          <option value=''>No parent category</option>
          {categories.length > 0 && categories.map(category => (
            <option value={category._id} key={category._id}>{category.name}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900">Save</button>
      </form>

      <div className="mb-2">
        <label className="block">Properties</label>
        {properties.length > 0 && properties.map((property, index) => (
          <div key={property.name} className="flex gap-1 mb-2 ">
            <input
              type="text"
              value={property.name}
              className="border-2 border-gray-300 rounded-md px-1  border-blue-900 mb-0"
              onChange={ev => handlePropertyNameChange(index, property, ev.target.value)}
              placeholder="property name (example: color)"
            />
            <input
              type="text"
              className="border-2 border-gray-300 rounded-md px-1  border-blue-900 mb-0"
              onChange={ev =>
                handlePropertyValuesChange(
                  index,
                  property,
                  ev.target.value
                )}
              value={property.values}
              placeholder="values, comma separated" 
            />
            <button
              onClick={() => removeProperty(index)}
              type="button"
              className="px-4 py-1 text-white rounded-md mb-0 rounded-sm bg-blue-900"
            >
              Remove
            </button>
          </div>
          
        ))}
         </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName('');
                setParentCategory('');
                setProperties([]);
              }}
              className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900">Cancel</button>
          )}
        <button></button>
        <div className="flex gap-1">
          <button type="button" className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900" onClick={addProperty}>
            Add new property
          </button>
         
        </div>
      </div>

      <table className="w-full mt-4">
        <thead className="bg-blue-100">
          <tr className="border border-blue-300 p-1">
            <td className="border border-blue-300 p-1">Category Name</td>
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
                  onClick={() => editCategory(category)}
                  className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900 mr-1"
                >
                  Edit
                </button>
                <button
                  className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900"
                  onClick={() => deleteCategory(category)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => (
  <Categories swal={swal} />
));
