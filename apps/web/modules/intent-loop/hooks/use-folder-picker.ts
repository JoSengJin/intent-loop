import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { detectPackage } from '@intent-loop/features/intent-loop/model';
import { detectRunInfo, mergeRunInfo } from '@intent-loop/features/intent-loop/project';
import type { Act, Update } from '@intent-loop/features/intent-loop/types';

type ReadPackage = () => Promise<string>;

export function useFolderPicker({ update, act }: { update: Update; act: Act }) {
  const folderRef = useRef<HTMLInputElement>(null);
  const [folderError, setFolderError] = useState('');

  async function applyFolder(folder: string, readPackage: ReadPackage | null) {
    update({ project: folder, detected: false });
    setFolderError('');
    if (!readPackage) return;
    try {
      act(mergeRunInfo, detectRunInfo(JSON.parse(await readPackage())));
    } catch { /* Keep the selected folder and manually entered settings. */ }
  }

  async function chooseFolder(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) { setFolderError('선택된 폴더의 파일을 읽지 못했습니다. 다시 선택하거나 샘플 프로젝트를 사용해 주세요.'); return; }
    const folder = files[0].webkitRelativePath?.split('/')[0] || '선택한 프로젝트';
    const file = detectPackage(files);
    await applyFolder(folder, file ? () => file.text() : null);
  }

  async function selectFolder() {
    setFolderError('');
    if (!window.showDirectoryPicker) {
      folderRef.current?.setAttribute('webkitdirectory', '');
      folderRef.current?.click();
      return;
    }
    try {
      const directory = await window.showDirectoryPicker();
      await applyFolder(directory.name, async () => {
        const packageFile = await directory.getFileHandle('package.json');
        return (await packageFile.getFile()).text();
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setFolderError('폴더 선택을 완료하지 못했습니다. 다시 시도하거나 샘플 프로젝트를 선택해 주세요.');
    }
  }

  return { folderRef, folderError, selectFolder, chooseFolder };
}
