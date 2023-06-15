import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useEffect } from 'react';
import {ReactSortable} from "react-sortablejs";
import Spinner from "@/components/Spinner";
export default function ProductForm({_id, title: existingTitle, description: existingDescription, price: existingPrice, images:existingImages, category: assignedCategory, properties:assignedProperties, }) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [price, setPrice] = useState(existingPrice || '');
  const router = useRouter();
  const [category, setCategory] = useState(assignedCategory || '');
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productProperties,setProductProperties] = useState(assignedProperties || {});
  const [images,setImages] = useState(existingImages || []);
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
      //ovo ce  update
      await axios.put('/api/products', { ...data, _id });
    } else {
      //  ovaj ce create
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
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
  function updateImagesOrder(images) {
    setImages(images);
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
      <div className="mb-2 flex flex-wrap gap-1">
          <ReactSortable
            list={images}
            className="flex flex-wrap gap-1"
            setList={updateImagesOrder}>
            {!!images?.length && images.map(link => (
              <div key={link} className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
                <img src={link} alt="" className="rounded-lg"/>
              </div>
            ))}
          </ReactSortable>
          {isUploading && (
            <div className="h-9 flex items-center">
              <Spinner />
            </div>
          )}
          <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              Add image
            </div>
            <input type="file" onChange={uploadImages} className="hidden"/>
          </label>
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
