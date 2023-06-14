import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useEffect } from 'react';

export default function ProductForm({_id, title: existingTitle, description: existingDescription, price: existingPrice, images, category: assignedCategory, properties:assignedProperties, }) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [price, setPrice] = useState(existingPrice || '');
  const router = useRouter();
  const [category, setCategory] = useState(assignedCategory || '');
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productProperties,setProductProperties] = useState(assignedProperties || {});

  useEffect(() => {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    })
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,productProperties
     
    };
    if (_id) {
      // update
      await axios.put('/api/products', { ...data, _id });
    } else {
      // create
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  async function createProduct(ev) {
    ev.preventDefault();
    const data = { title, description, price };

    if (_id) {
      // update
      await axios.put('/api/products', { ...data, _id });
    } else {
      // create
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push('/products');
  }
  function setProductProp(propName,value) {
    setProductProperties(prev => {
      const newProductProps = {...prev};
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data);
      setImages(oldImages => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  }
  

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        className="border-2 border-grey-300 rounded-md px-1 w-full"
        placeholder="Product name"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />

      <label>Category</label>
      <select
        value={category}
        onChange={ev => setCategory(ev.target.value)}
        className="border-2 border-grey-300 rounded-md px-1 w-full"
      >
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map(c => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
      </select>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map(p => (
          <div key={p.name} className="">
            <label>{p.name && typeof p.name === 'string' ? p.name[0].toUpperCase() + p.name.substring(1) : ''}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={ev => setProductProp(p.name, ev.target.value)}
                className="border-2 border-grey-300 rounded-md px-1 w-full"
              >
                {p.values.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

      <label>Photos</label>
      <div className="mb-2">
        <label className="cursor-pointer w-24 h-24 border text-center flex items-center gap-1 text-gray-500 rounded-lg bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
          </svg>
          Upload
          <input type="file" className="hidden" onChange={uploadImages} />
        </label>

        {!images?.length && <div>No photos in product </div>}
      </div>

      <label className="blue-900">Description</label>
      <textarea
        placeholder="Description"
        className="border-2 border-grey-300 rounded-md px-1 w-full"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      ></textarea>

      <label className="blue-900">Price (in BAM)</label>
      <input
        type="number"
        placeholder="Price"
        className="border-1 border-grey-300 rounded-md px-1 w-full"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />

      <button className="px-4 py-1 text-white rounded-md rounded-sm bg-blue-900" type="submit">
        Save
      </button>
    </form>
  );
}
