import { GetStaticProps } from 'next'
import Head from 'next/head';
import Image from 'next/image';
import { SubscribeButton } from '../components/SubscribeButton';

import avatar from '../../public/images/avatar.svg'

import styles from './home.module.scss';
import { stripe } from '../services/stripe';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        <Image src={avatar} alt="Girl coding" width={521} height={336}/>
      </main>
    </>
  )
}

export const getStaticProps:GetStaticProps = async() => {
  const price = await stripe.prices.retrieve('price_1Kv8alG21DxEWmn19VGC0MFy')

  const product = {
    priceId: price.id,
    amount: Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'      
    }).format(price.unit_amount / 100) ,
  };

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}