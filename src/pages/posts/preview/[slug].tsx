import { GetServerSideProps, GetStaticPaths, GetStaticProps, NextApiRequest, PreviewData } from "next"
import { createClient, linkResolver } from "../../../services/prismic";
import { RichText, Date, RichTextBlock} from 'prismic-reactjs';
import Head from "next/head";
import styles from '../post.module.scss';
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";


type Post = {
    slug: string;
    title: string;
    content: RichTextBlock[];
    updated_at: string;
}

export interface PostPreviewProps {
    post: Post;
}

interface ServerSideProps extends GetServerSideProps {
    previewData: PreviewData;
    req: NextApiRequest;
    params: {
        slug: string;
    };
}

export default function PostPreview({ post }: PostPreviewProps){
    const { data:session } = useSession();
    const router = useRouter()

    useEffect(()=>{
        if (session?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
    },[session, router, post.slug])

    return(
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updated_at}</time>
                    <div className={`${styles.postContent} ${styles.previewContent}`}>
                    <RichText render={post.content} linkResolver={linkResolver} />
                    </div>
                    
                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/">
                            <a href="">Subscribe now 🤗</a>
                        </Link>
                    </div>                    
                </article>
            </main>
        </>
    )
}

export const getStaticPaths:GetStaticPaths = () => {
    return {
        paths: [
            { params: { slug: 'utilizando-path-mapping-no-typescript'}}
        ],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ previewData, params }:ServerSideProps) => {
    
    const { slug } = params;
 
    const prismic  = createClient({ previewData })

    const response = await prismic.getByUID('post', String(slug), {})
    
    const post = {
        slug: response.uid,
        title: RichText.asText(response.data.title),
        content: response.data.content.splice(0,3) as RichTextBlock,
        updated_at: Date(response.last_publication_date).toLocaleDateString('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        })
    }

    return {
        props: { post }, // Will be passed to the page component as props
        redirect: 60 * 30
    }
}