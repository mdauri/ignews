import { GetServerSideProps, NextApiRequest, PreviewData } from "next"
import { getSession } from "next-auth/react"
import { createClient, linkResolver } from "../../services/prismic";
import {Link, RichText, Date, RichTextBlock} from 'prismic-reactjs';
import Head from "next/head";
import styles from './post.module.scss';


type Post = {
    slug: string;
    title: string;
    content: RichTextBlock[];
    updated_at: string;
}

export interface PostProps {
    post: Post;
}

interface ServerSideProps extends GetServerSideProps {
    previewData: PreviewData;
    req: NextApiRequest;
    params: {
        slug: string;
    };
}

export default function Post({ post }: PostProps){
    return(
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updated_at}</time>
                    <div className={styles.postContent}>
                    <RichText render={post.content} linkResolver={linkResolver} />
                    </div>                    
                </article>
            </main>
        </>
    )
}

export const getServerSideProps = async ({ previewData, params, req }:ServerSideProps) => {
    const session = await getSession({ req })
    const { slug } = params;
 
    if (!session?.activeSubscription){
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const prismic  = createClient({ previewData })

    const response = await prismic.getByUID('post', String(slug), {})
    
    const post = {
        slug: response.uid,
        title: RichText.asText(response.data.title),
        content: response.data.content,
        updated_at: Date(response.last_publication_date).toLocaleDateString('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        })
    }

    return {
        props: { post }, // Will be passed to the page component as props
    }
}