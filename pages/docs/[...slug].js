import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import DocLayout from '../../components/DocLayout'

import { MDXProvider, } from '../../components/MDX'
import { postDocPaths, DOCS_PATH, sideMenuItems } from '../../utils/mdxUtils'


export default function DocPage({ source, frontMatter, sideNav }) {
  return (
    <DocLayout title={frontMatter.title} navGroups={sideNav} >
      <MDXProvider >
        <MDXRemote {...source} />
      </MDXProvider>
    </DocLayout>
  )
}

export const getStaticProps = async ({ params }) => {
  const docFilePath = path.join.apply(null, [DOCS_PATH, ...params.slug])
  const source = fs.readFileSync(`${docFilePath}.mdx`)
  const { content, data } = matter(source)
  const autolink = require('../../lib/remark-autolink-headers')
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [autolink],
    },
    scope: data,
  })
  
  const sideNav = sideMenuItems()
  // sideNav.forEach(group => console.log(group))
  return {
    props: {
      source: mdxSource,
      frontMatter: data,
      sideNav,
    },
  }
}

export const getStaticPaths = async () => {
  const paths = postDocPaths()
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({ params: { slug: slug.split('/') } }))
    // console.log(paths)
  return {
    paths,
    fallback: false,
  }
}
