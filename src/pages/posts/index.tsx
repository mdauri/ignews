import { GetStaticProps } from 'next';
import Head from 'next/head';
import { createClient } from '../../services/prismic';
import { RichText } from 'prismic-reactjs';
import styles from './styles.module.scss';
import Link from 'next/link';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updated_at: string;
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({ posts }:PostsProps) {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>
            <main className={styles.container}>
                <div className={styles.posts}>
                    { posts.map(post => (
                        <Link key={post.slug} href={`/posts/${post.slug}`}>
                            <a>
                                <time>{post.updated_at}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    )) }
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
    const prismic = createClient({ previewData })
    const response = await prismic.getAllByType('post', {
        pageSize: 100,
    })  

    const posts = response?.map((post: any) => {        
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.content.find((content: any) => content.type === 'paragraph')?.text,
            updated_at: new Date(post.last_publication_date).toLocaleDateString('pt-PT', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
            })
        }
    });

    return {
        props: { posts }, // Will be passed to the page component as props
    }
}