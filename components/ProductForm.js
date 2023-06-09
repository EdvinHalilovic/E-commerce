import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function ProductForm({_id, title: existingTitle, description: existingDescription, price: existingPrice }) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [price, setPrice] = useState(existingPrice || '');
  const router = useRouter();
  const [goToProducts, setGoToProducts] = useState(false);

  async function createProduct(ev) {
    ev.preventDefault();
    const data = { title, description, price };

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

  return (
    <form onSubmit={createProduct}>
      <label>Product name</label>
      <input
        type="text"
        className="border-2 border-grey-300 rounded-md px-1 w-full"
        placeholder="Product name"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
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
